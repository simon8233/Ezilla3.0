/* -------------------------------------------------------------------------- */
/* Copyright 2002-2013, OpenNebula Project (OpenNebula.org), C12G Labs        */
/*                                                                            */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may    */
/* not use this file except in compliance with the License. You may obtain    */
/* a copy of the License at                                                   */
/*                                                                            */
/* http://www.apache.org/licenses/LICENSE-2.0                                 */
/*                                                                            */
/* Unless required by applicable law or agreed to in writing, software        */
/* distributed under the License is distributed on an "AS IS" BASIS,          */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   */
/* See the License for the specific language governing permissions and        */
/* limitations under the License.                                             */
/* -------------------------------------------------------------------------- */

#include "ImageManagerDriver.h"
#include "ImagePool.h"

#include "NebulaLog.h"

#include "Nebula.h"
#include <sstream>

/* ************************************************************************** */
/* Driver ASCII Protocol Implementation                                       */
/* ************************************************************************** */

void ImageManagerDriver::cp(int           oid,
                            const string& drv_msg) const
{
    ostringstream os;

    os << "CP " << oid << " " << drv_msg << endl;

    write(os);
}

/* -------------------------------------------------------------------------- */

void ImageManagerDriver::clone(int           oid,
                               const string& drv_msg) const
{
    ostringstream os;

    os << "CLONE " << oid << " " << drv_msg << endl;

    write(os);
}

/* -------------------------------------------------------------------------- */
void ImageManagerDriver::stat(int           oid,
                              const string& drv_msg) const
{
    ostringstream os;

    os << "STAT " << oid << " " << drv_msg << endl;

    write(os);
}

/* -------------------------------------------------------------------------- */

void ImageManagerDriver::mkfs(int           oid,
                              const string& drv_msg) const
{
    ostringstream os;

    os << "MKFS " << oid << " " << drv_msg << endl;

    write(os);
}

/* -------------------------------------------------------------------------- */

void ImageManagerDriver::rm(int oid, const string& drv_msg) const
{
    ostringstream os;

    os << "RM " << oid << " " << drv_msg << endl;

    write(os);
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

/* ************************************************************************** */
/* MAD Interface                                                              */
/* ************************************************************************** */

static void stat_action(istringstream& is, int id, const string& result)
{
    string size_mb;
    string info;

    Nebula& nd        = Nebula::instance();
    ImageManager * im = nd.get_imagem();

    if ( result == "SUCCESS" )
    {
        if ( is.good() )
        {
            is >> size_mb >> ws;
        }

        if ( is.fail() )
        {
            im->notify_request(id, false, "Cannot get size from STAT");
        }

        im->notify_request(id, true, size_mb);
    }
    else
    {
        getline(is,info);

        im->notify_request(id, false, info);
    }
}

/* -------------------------------------------------------------------------- */

static void cp_action(istringstream& is,
                      ImagePool*     ipool,
                      int            id,
                      const string&  result)
{
    string  source;
    string  info;

    Image * image;

    ostringstream oss;

    image = ipool->get(id,true);

    if ( image == 0 )
    {
        if (result == "SUCCESS")
        {
            ostringstream oss;

            if ( is.good())
            {
                is >> source >> ws;
            }

            if (!source.empty())
            {
                oss << "CP operation succeeded but image no longer exists."
                    << " Source image: " << source << ", may be left in datastore";

                NebulaLog::log("ImM", Log::ERROR, oss);
            }
        }

        return;
    }

    if ( result == "FAILURE" )
    {
       goto error;
    }

    if ( is.good() )
    {
        is >> source >> ws;
    }

    if ( is.fail() )
    {
        goto error;
    }

    image->set_source(source);

    image->set_state(Image::READY);

    ipool->update(image);

    image->unlock();

    NebulaLog::log("ImM", Log::INFO, "Image copied and ready to use.");

    return;

error:
    oss << "Error copying image in the datastore";

    getline(is, info);

    if (!info.empty() && (info[0] != '-'))
    {
        oss << ": " << info;
    }

    NebulaLog::log("ImM", Log::ERROR, oss);

    image->set_template_error_message(oss.str());
    image->set_state(Image::ERROR);

    ipool->update(image);

    image->unlock();

    return;
}

/* -------------------------------------------------------------------------- */

static void clone_action(istringstream& is,
                         ImagePool*     ipool,
                         int            id,
                         const string&  result)
{
    int     cloning_id;
    string  source;
    string  info;

    Image * image;

    ostringstream oss;

    Nebula& nd        = Nebula::instance();
    ImageManager * im = nd.get_imagem();

    image = ipool->get(id, true);

    if ( image == 0 )
    {
        if (result == "SUCCESS")
        {
            ostringstream oss;

            if ( is.good())
            {
                is >> source >> ws;
            }

            if (!source.empty())
            {
                oss << "CLONE operation succeeded but image no longer exists."
                    << " Source image: " << source << ", may be left in datastore";

                NebulaLog::log("ImM", Log::ERROR, oss);
            }
        }

        return;
    }

    cloning_id = image->get_cloning_id();

    if ( result == "FAILURE" )
    {
       goto error;
    }

    if ( is.good() )
    {
        is >> source >> ws;
    }

    if ( is.fail() )
    {
        goto error;
    }

    image->set_source(source);

    image->set_state(Image::READY);

    image->clear_cloning_id();

    ipool->update(image);

    image->unlock();

    NebulaLog::log("ImM", Log::INFO, "Image cloned and ready to use.");

    im->release_cloning_image(cloning_id, id);

    return;

error:
    oss << "Error cloning from Image " << cloning_id;

    getline(is, info);

    if (!info.empty() && (info[0] != '-'))
    {
        oss << ": " << info;
    }

    NebulaLog::log("ImM", Log::ERROR, oss);

    image->set_template_error_message(oss.str());
    image->set_state(Image::ERROR);

    image->clear_cloning_id();

    ipool->update(image);

    image->unlock();

    im->release_cloning_image(cloning_id, id);

    return;
}

/* -------------------------------------------------------------------------- */

static void mkfs_action(istringstream& is,
                        ImagePool*     ipool,
                        int            id,
                        const string&  result)
{
    string  source;
    Image * image;
    bool    is_saving = false;
    bool    is_hot    = false;

    string info;
    int    rc;

    int vm_id = -1;
    int disk_id;

    VirtualMachine * vm;
    ostringstream    oss;

    Nebula& nd                  = Nebula::instance();
    VirtualMachinePool * vmpool = nd.get_vmpool();
    TransferManager *  tm       = nd.get_tm();

    image = ipool->get(id, true);

    if ( image == 0 )
    {
        if (result == "SUCCESS")
        {
            ostringstream oss;

            if ( is.good())
            {
                is >> source >> ws;
            }

            if (!source.empty())
            {
                oss << "MkFS operation succeeded but image no longer exists."
                    << " Source image: " << source << ", may be left in datastore";

                NebulaLog::log("ImM", Log::ERROR, oss);
            }
        }

        return;
    }

    is_saving = image->isSaving();
    is_hot    = image->isHot();

    if ( is_saving )
    {
        image->get_template_attribute("SAVED_VM_ID", vm_id);
        image->get_template_attribute("SAVED_DISK_ID", disk_id);
    }

    if ( result == "FAILURE" )
    {
        goto error_img;
    }

    if ( !is.fail() )
    {
        is >> source >> ws;
    }
    else
    {
        goto error_img;
    }

    image->set_source(source);

    if (!is_saving)
    {
        image->set_state(Image::READY);
    }

    NebulaLog::log("ImM", Log::INFO, "Image created and ready to use");

    ipool->update(image);

    image->unlock();

    if ( !is_saving )
    {
        return;
    }

    vm = vmpool->get(vm_id, true);

    if ( vm == 0 )
    {
        goto error_save_get;
    }

    if ( is_hot ) //Saveas hot, trigger disk copy
    {
        rc = vm->save_disk_hot(disk_id, source, id);

        if ( rc == -1 )
        {
            goto error_save_state;
        }

        tm->trigger(TransferManager::SAVEAS_HOT, vm_id);
    }
    else //setup disk information
    {
        rc = vm->save_disk(disk_id, source, id);

        if ( rc == -1 )
        {
            goto error_save_state;
        }

        vm->clear_saveas_state(disk_id, is_hot);
    }

    vmpool->update(vm);

    vm->unlock();

    return;

error_img:
    oss << "Error creating datablock";
    goto error;

error_save_get:
    oss << "Image created for SAVE_AS, but the associated VM does not exist.";
    goto error_save;

error_save_state:
    vm->unlock();
    oss << "Image created for SAVE_AS, but VM is no longer running";

error_save:
    image = ipool->get(id, true);

    if ( image == 0 )
    {
        NebulaLog::log("ImM", Log::ERROR, oss);
        return;
    }

error:
    getline(is,info);

    if (!info.empty() && (info[0] != '-'))
    {
        oss << ": " << info;
    }

    NebulaLog::log("ImM", Log::ERROR, oss);

    image->set_template_error_message(oss.str());
    image->set_state(Image::ERROR);

    ipool->update(image);

    image->unlock();

    if (is_saving && vm_id != -1)
    {
        if ((vm = vmpool->get(vm_id, true)) != 0)
        {
            vm->clear_saveas_state(disk_id, is_hot);
            vmpool->update(vm);

            vm->unlock();
        }
    }

    return ;
}

/* -------------------------------------------------------------------------- */

static void rm_action(istringstream& is,
                      ImagePool*     ipool,
                      int            id,
                      const string&  result)
{
    int     rc;
    string  tmp_error;
    string  source;
    string  info;
    Image * image;

    ostringstream oss;

    image = ipool->get(id, true);

    if ( image == 0 )
    {
        return;
    }

    source = image->get_source();

    rc = ipool->drop(image, tmp_error);

    image->unlock();

    if ( result == "FAILURE" )
    {
       goto error;
    }
    else if ( rc < 0 )
    {
        goto error_drop;
    }

    NebulaLog::log("ImM", Log::INFO, "Image successfully removed.");

    return;

error_drop:
    oss << "Error removing image from DB: " << tmp_error
        << ". Remove image source " << source << " to completely delete image.";

    NebulaLog::log("ImM", Log::ERROR, oss);
    return;

error:
    oss << "Error removing image from datastore. Manually remove image source "
        << source << " to completely delete the image";

    getline(is,info);

    if (!info.empty() && (info[0] != '-'))
    {
        oss << ": " << info;
    }

    NebulaLog::log("ImM", Log::ERROR, oss);

    return;
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

void ImageManagerDriver::protocol(const string& message) const
{
    istringstream is(message);
    ostringstream oss;

    string action;
    string result;
    string source;
    string info;
    int    id;

    oss << "Message received: " << message;
    NebulaLog::log("ImG", Log::DEBUG, oss);

    // --------------------- Parse the driver message --------------------------

    if ( is.good() )
        is >> action >> ws;
    else
        return;

    if ( is.good() )
        is >> result >> ws;
    else
        return;

    if ( is.good() )
    {
        is >> id >> ws;

        if ( is.fail() )
        {
            if ( action == "LOG" )
            {
                is.clear();
                getline(is,info);

                NebulaLog::log("ImG",log_type(result[0]), info.c_str());
            }

            return;
        }
    }
    else
        return;

    if ( action == "STAT" )
    {
        stat_action(is, id, result);
    }
    else if ( action == "CP" )
    {
        cp_action(is, ipool, id, result);
    }
    else if ( action == "CLONE" )
    {
        clone_action(is, ipool, id, result);
    }
    else if ( action == "MKFS" )
    {
        mkfs_action(is, ipool, id, result);
    }
    else if ( action == "RM" )
    {
        rm_action(is, ipool, id, result);
    }
    else if (action == "LOG")
    {
        getline(is,info);
        NebulaLog::log("ImM", log_type(result[0]), info.c_str());
    }

    return;
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

void ImageManagerDriver::recover()
{
    NebulaLog::log("ImG",Log::INFO,"Recovering Image Repository drivers");
}


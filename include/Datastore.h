/* ------------------------------------------------------------------------ */
/* Copyright 2002-2014, OpenNebula Project (OpenNebula.org), C12G Labs      */
/*                                                                          */
/* Licensed under the Apache License, Version 2.0 (the "License"); you may  */
/* not use this file except in compliance with the License. You may obtain  */
/* a copy of the License at                                                 */
/*                                                                          */
/* http://www.apache.org/licenses/LICENSE-2.0                               */
/*                                                                          */
/* Unless required by applicable law or agreed to in writing, software      */
/* distributed under the License is distributed on an "AS IS" BASIS,        */
/* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. */
/* See the License for the specific language governing permissions and      */
/* limitations under the License.                                           */
/* -------------------------------------------------------------------------*/

#ifndef DATASTORE_H_
#define DATASTORE_H_

#include "PoolSQL.h"
#include "ObjectCollection.h"
#include "DatastoreTemplate.h"
#include "Clusterable.h"
#include "Image.h"

/**
 *  The Datastore class.
 */
class Datastore : public PoolObjectSQL, ObjectCollection, public Clusterable
{
public:
    /**
     *  Type of Datastore
     */
    enum DatastoreType
    {
        IMAGE_DS  = 0, /** < Standard datastore for disk images */
        SYSTEM_DS = 1, /** < System datastore for disks of running VMs */
        FILE_DS   = 2  /** < File datastore for context, kernel, initrd files */
    };

    /**
     *  Return the string representation of a DatastoreType
     *    @param ob the type
     *    @return the string
     */
    static string type_to_str(DatastoreType ob)
    {
        switch (ob)
        {
            case IMAGE_DS:  return "IMAGE_DS" ; break;
            case SYSTEM_DS: return "SYSTEM_DS" ; break;
            case FILE_DS:   return "FILE_DS" ; break;
            default:        return "";
        }
    };

    /**
     *  Return the string representation of a DatastoreType
     *    @param str_type string representing the DatastoreTypr
     *    @return the DatastoreType (defaults to IMAGE_DS)
     */
    static DatastoreType str_to_type(string& str_type);

    /**
     * Function to print the Datastore object into a string in XML format
     *  @param xml the resulting XML string
     *  @return a reference to the generated string
     */
    string& to_xml(string& xml) const;

    /**
     *  Rebuilds the object from an xml formatted string
     *    @param xml_str The xml-formatted string
     *
     *    @return 0 on success, -1 otherwise
     */
    int from_xml(const string &xml_str);

    /**
     *  Adds this image's ID to the set.
     *    @param id of the image to be added to the Datastore
     *    @return 0 on success
     */
    int add_image(int id)
    {
        return add_collection_id(id);
    };

    /**
     *  Deletes this image's ID from the set.
     *    @param id of the image to be deleted from the Datastore
     *    @return 0 on success
     */
    int del_image(int id)
    {
        return del_collection_id(id);
    };

    /**
     *  Returns a copy of the Image IDs set
     */
    set<int> get_image_ids()
    {
        return get_collection_copy();
    }

    /**
     *  Retrieves TM mad name
     *    @return string tm mad name
     */
    const string& get_tm_mad() const
    {
        return tm_mad;
    };

    /**
     *  Retrieves the base path
     *    @return base path string
     */
    const string& get_base_path() const
    {
        return base_path;
    };

    /**
     *  Retrieves the disk type
     *    @return disk type
     */
    Image::DiskType get_disk_type() const
    {
        return disk_type;
    };

    /**
     * Returns the datastore type
     *    @return datastore type
     */
    DatastoreType get_type() const
    {
        return type;
    };

    /**
     * Modifies the given VM disk attribute adding the relevant datastore
     * attributes
     *
     * @param disk
     * @param inherit_attrs Attributes to be inherited from the DS template
     *   into the disk
     * @return 0 on success
     */
    int disk_attribute(
            VectorAttribute *       disk,
            const vector<string>&   inherit_attrs);


    /**
     *  Replace template for this object. Object should be updated
     *  after calling this method
     *    @param tmpl string representation of the template
     */
    int replace_template(const string& tmpl_str, string& error);

    /**
     *  Set monitor information for the Datastore
     *    @param total_mb
     *    @param free_mb
     *    @param used_mb
     */
    void update_monitor(long long total, long long free, long long used)
    {
        total_mb = total;
        free_mb  = free;
        used_mb  = used;
    }

    /**
     *  Returns the available capacity in the datastore.
     *    @params avail the total available size in the datastore (MB)
     *    @return true if the datastore is configured to enforce capacity
     *    checkings
     */
    bool get_avail_mb(long long &avail);

    /**
     * Returns true if the DS contains the SHARED = YES attribute
     * @return true if the DS is shared
     */
    bool is_shared()
    {
        bool shared;

        if (!get_template_attribute("SHARED", shared))
        {
            shared = true;
        }

        return shared;
    };

private:

    // -------------------------------------------------------------------------
    // Friends
    // -------------------------------------------------------------------------

    friend class DatastorePool;

    // *************************************************************************
    // Datastore Private Attributes
    // *************************************************************************

    /**
     * Name of the datastore driver used to register new images
     */
    string ds_mad;

    /**
     *  Name of the TM driver used to transfer file to and from the hosts
     */
    string tm_mad;

    /**
     * Base path for the storage
     */
    string base_path;

    /**
     * The datastore type
     */
    DatastoreType type;

    /**
     * Disk types for the Images created in this datastore
     */
     Image::DiskType disk_type;

    /**
     * Total datastore capacity in MB
     */
     long long total_mb;

    /**
     * Available datastore capacity in MB
     */
     long long free_mb;

    /**
     * Used datastore capacity in MB
     */
     long long used_mb;

    // *************************************************************************
    // Constructor
    // *************************************************************************

    Datastore(
            int                 uid,
            int                 gid,
            const string&       uname,
            const string&       gname,
            int                 umask,
            DatastoreTemplate*  ds_template,
            int                 cluster_id,
            const string&       cluster_name);

    virtual ~Datastore(){};

    // *************************************************************************
    // DataBase implementation (Private)
    // *************************************************************************

    static const char * db_names;

    static const char * db_bootstrap;

    static const char * table;

    /**
     *  Execute an INSERT or REPLACE Sql query.
     *    @param db The SQL DB
     *    @param replace Execute an INSERT or a REPLACE
     *    @param error_str Returns the error reason, if any
     *    @return 0 one success
     */
    int insert_replace(SqlDB *db, bool replace, string& error_str);

    /**
     *  Bootstraps the database table(s) associated to the Datastore
     *    @return 0 on success
     */
    static int bootstrap(SqlDB * db)
    {
        ostringstream oss(Datastore::db_bootstrap);

        return db->exec(oss);
    };

    /**
     *  Writes the Datastore in the database.
     *    @param db pointer to the db
     *    @return 0 on success
     */
    int insert(SqlDB *db, string& error_str);

    /**
     *  Writes/updates the Datastore's data fields in the database.
     *    @param db pointer to the db
     *    @return 0 on success
     */
    int update(SqlDB *db)
    {
        string error_str;
        return insert_replace(db, true, error_str);
    }

    /**
     *  Factory method for datastore templates
     */
    Template * get_new_template() const
    {
        return new DatastoreTemplate;
    }

    int set_tm_mad(string &tm_mad, string &error_str);
};

#endif /*DATASTORE_H_*/

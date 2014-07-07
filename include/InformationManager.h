/* -------------------------------------------------------------------------- */
/* Copyright 2002-2014, OpenNebula Project (OpenNebula.org), C12G Labs        */
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

#ifndef INFORMATION_MANAGER_H_
#define INFORMATION_MANAGER_H_

#include "MadManager.h"
#include "ActionManager.h"
#include "InformationManagerDriver.h"
#include "MonitorThread.h"

using namespace std;

extern "C" void * im_action_loop(void *arg);

class HostPool;
class ClusterPool;

class InformationManager : public MadManager, public ActionListener
{
public:

    InformationManager(
        HostPool *                  _hpool,
        ClusterPool *               _clpool,
        time_t                      _timer_period,
        time_t                      _monitor_period,
        int                         _host_limit,
        int                         _monitor_threads,
        const string&               _remotes_location,
        vector<const Attribute*>&   _mads)
            :MadManager(_mads),
            hpool(_hpool),
            clpool(_clpool),
            timer_period(_timer_period),
            monitor_period(_monitor_period),
            host_limit(_host_limit),
            remotes_location(_remotes_location),
            mtpool(_monitor_threads)
    {
        am.addListener(this);
    };

    ~InformationManager(){};

    enum Actions
    {
        STOPMONITOR /** Sent by the RM when a host is deleted **/
    };

    /**
     *  Triggers specific actions to the Information Manager.
     *    @param action the IM action
     *    @param hid Host unique id. This is the argument of the passed to the
     *    invoked action.
     */
    void trigger(
        Actions action,
        int     vid);

    /**
     *  This functions starts the associated listener thread, and creates a
     *  new thread for the Information Manager. This thread will wait in
     *  an action loop till it receives ACTION_FINALIZE.
     *    @return 0 on success.
     */
    int start();

    /**
     *  Gets the thread identification.
     *    @return pthread_t for the manager thread (that in the action loop).
     */
    pthread_t get_thread_id() const
    {
        return im_thread;
    };

    /**
     *
     */
    int load_mads(int uid=0);

    /**
     *
     */
    void finalize()
    {
        am.trigger(ACTION_FINALIZE,0);
    };

    void stop_monitor(int hid);

private:
    /**
     *  Thread id for the Information Manager
     */
    pthread_t       im_thread;

    /**
     *  Pointer to the Host Pool
     */
    HostPool *      hpool;

    /**
     *  Pointer to the Cluster Pool
     */
    ClusterPool *   clpool;

    /**
     *  Timer period for the Virtual Machine Manager.
     */
    time_t          timer_period;

    /**
     *  Host monitoring interval
     */
    time_t          monitor_period;

    /**
     *  Host monitoring limit
     */
    int             host_limit;

   /**
    *  Path for the remote action programs
    */
    string          remotes_location;

    /**
     *  Action engine for the Manager
     */
    ActionManager   am;

    /**
     *  Pool of threads to process each monitor message
     */
    MonitorThreadPool mtpool;

    /**
     *  Function to execute the Manager action loop method within a new pthread
     * (requires C linkage)
     */
    friend void * im_action_loop(void *arg);

    /**
     *  Time in seconds to expire a monitoring action (5 minutes)
     */
    static const time_t monitor_expire;

    /**
     *  Returns a pointer to a Information Manager MAD. The driver is
     *  searched by its name and owned by gwadmin with uid=0.
     *    @param name of the driver
     *    @return the VM driver owned by uid 0, with attribute "NAME" equal to
     *    name or 0 in not found
     */
    const InformationManagerDriver * get(
        const string&   name)
    {
        string _name("NAME");
        return static_cast<const InformationManagerDriver *>
               (MadManager::get(0,_name,name));
    };

    /**
     *  The action function executed when an action is triggered.
     *    @param action the name of the action
     *    @param arg arguments for the action function
     */
    void do_action(
        const string &  action,
        void *          arg);

    /**
     *  This function is executed periodically to monitor Nebula hosts.
     */
    void timer_action();
};

#endif /*VIRTUAL_MACHINE_MANAGER_H*/


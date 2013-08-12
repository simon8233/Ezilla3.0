class RbVmomi::VIM::VirtualMachine
  # Retrieve the MAC addresses for all virtual NICs.
  # @return [Hash] Keyed by device label.
  def macs
    Hash[self.config.hardware.device.grep(RbVmomi::VIM::VirtualEthernetCard).map { |x| [x.deviceInfo.label, x.macAddress] }]
  end
  
  # Retrieve all virtual disk devices.
  # @return [Array] Array of virtual disk devices.
  def disks
    self.config.hardware.device.grep(RbVmomi::VIM::VirtualDisk)
  end
  
  # Get the IP of the guest, but only if it is not stale 
  # @return [String] Current IP reported (as per VMware Tools) or nil
  def guest_ip 
    g = self.guest
    if g.ipAddress && (g.toolsStatus == "toolsOk" || g.toolsStatus == "toolsOld")
      g.ipAddress
    else
      nil
    end
  end  

  # Add a layer of delta disks (redo logs) in front of every disk on the VM.
  # This is similar to taking a snapshot and makes the VM a valid target for
  # creating a linked clone.
  #
  # Background: The API for linked clones is quite strange. We can't create 
  # a linked straight from any VM. The disks of the VM for which we can create a
  # linked clone need to be read-only and thus VC demands that the VM we
  # are cloning from uses delta-disks. Only then it will allow us to
  # share the base disk.
  def add_delta_disk_layer_on_all_disks
    devices,  = self.collect 'config.hardware.device'
    disks = devices.grep(RbVmomi::VIM::VirtualDisk)
    # XXX: Should create a single reconfig spec instead of one per disk
    disks.each do |disk|
      spec = {
        :deviceChange => [
          {
            :operation => :remove,
            :device => disk
          },
          {
            :operation => :add,
            :fileOperation => :create,
            :device => disk.dup.tap { |x|
              x.backing = x.backing.dup
              x.backing.fileName = "[#{disk.backing.datastore.name}]"
              x.backing.parent = disk.backing
            },
          }
        ]
      }
      self.ReconfigVM_Task(:spec => spec).wait_for_completion
    end
  end 
end

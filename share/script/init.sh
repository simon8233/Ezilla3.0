#!/bin/bash
DEBIAN_ETH_FILE="/etc/network/interfaces"
HOSTS_FILE="hosts"
ROOT_PRIKEY="id_rsa"
USER_PRIKEY="id_rsa"


user_exist=`cat /etc/passwd|  awk 'BEGIN {FS=":"} {print $1}' |grep "^$USERNAME$"`

if [ -f /etc/init.d/iptables ];	then
   /etc/init.d/iptables stop
fi

if [ -f /mnt/context.sh ]; then
  . /mnt/context.sh
fi

if [ -f /mnt/$HOSTS_FILE ]; then
        cp /mnt/$HOSTS_FILE /etc/
fi

if [ -f /mnt/$ROOT_PUBKEY ]; then
	mkdir -p /root/.ssh
	cat /mnt/$ROOT_PUBKEY >> /root/.ssh/authorized_keys
        echo "Host *" > /root/.ssh/config
        echo "StrictHostKeyChecking no" >> /root/.ssh/config
	chmod -R 600 /root/.ssh
fi

if [ -f /mnt/$ROOT_PRIKEY ]; then
        cp /mnt/$ROOT_PRIKEY /root/.ssh/
        chmod -R 600 /root/.ssh
fi

if [ -f /etc/network/interfaces ];then
	/etc/init.d/networking restart
fi

if [ "$USERNAME" != "$user_exist" ]; then
	if [ -n "$USERNAME" ]; then
		if [ -e "$DEBIAN_ETH_FILE" ]; then
                	if [ -n "$USER_PASSWD" ]; then
                        	useradd -s /bin/bash -m $USERNAME -p "$USER_PASSWD"
                        	echo $USERNAME:"$USER_PASSWD" | chpasswd
                        	echo "root:$USER_PASSWD" | chpasswd
                	else
                        	useradd -s /bin/bash -m $USERNAME
                	fi
			if [ -n "$DEBIAN_DEB" ]; then 
				/usr/bin/dpkg -i /mnt/*.deb
			fi
		else
			if [ -n "$USER_PASSWD" ]; then
				useradd -s /bin/bash -m $USERNAME -p "$USER_PASSWD"
				echo "$USER_PASSWD" | passwd $USERNAME --stdin
				echo "$USER_PASSWD" | passwd root --stdin
			else
				useradd -s /bin/bash -m $USERNAME
			fi
		fi
	fi
fi

if [ -f /mnt/$USER_PUBKEY ]; then
	mkdir -p /home/$USERNAME/.ssh/
	cat /mnt/$USER_PUBKEY >> /home/$USERNAME/.ssh/authorized_keys
	echo "Host *" > /home/$USERNAME/.ssh/config
  	echo "StrictHostKeyChecking no" >> /home/$USERNAME/.ssh/config
	chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh
	chmod -R 700 /home/$USERNAME/.ssh
fi

if [ -f /mnt/$USER_PRIKEY ]; then
         cp /mnt/$USER_PRIKEY /home/$USERNAME/.ssh/
         chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh
         chmod -R 700 /home/$USERNAME/.ssh
fi
	

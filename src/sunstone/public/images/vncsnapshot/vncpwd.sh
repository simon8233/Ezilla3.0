#!/usr/bin/expect --
set host [lindex $argv 0]
set port [lindex $argv 1]
set filename [lindex $argv 2]
set passwd [lindex $argv 3]
set passwd_length [string length $passwd]
if {$passwd_length == 0} {
        exec ./vncsnapshot -allowblank -quiet -jpeg $host:$port $filename &
        exit
}
spawn ./vncsnapshot -allowblank -quiet -jpeg $host:$port $filename
expect "Password:*"
send "$passwd\n"
expect "Password:*"
exit


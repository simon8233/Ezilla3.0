#!/usr/bin/expect --
set path [lindex $argv 0]
set host [lindex $argv 1]
set port [lindex $argv 2]
set filename [lindex $argv 3]
set passwd [lindex $argv 4]
set passwd_length [string length $passwd]
if {$passwd_length == 0} {
        exec $path/vncsnapshot -allowblank -quiet -jpeg $host:$port $filename &
        exit
}
spawn $path/vncsnapshot -allowblank -quiet -jpeg $host:$port $filename
expect "Password:*"
send "$passwd\n"
expect "Password:*"
exit


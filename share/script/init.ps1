$content = Get-Content -path d:\context.sh 
$context = @{}

# Read All Context Variables from context.sh
foreach ($line in $content)
{
    if ($line[0] -ne '#')
    {
        $var = $line.split('=')
        if ($var[1] -ne $null)
        {
            #remove the " " of variables
            $var[1] = $var[1] -replace '^"|"$',""
            $context.Set_Item($var[0], $var[1])
        }
    }
}

#Setup the IP, gateway, netmask, dns
if ($context.Get_Item("IP_PUBLIC") -ne $null)
{
    netsh interface ip set address "區域連線" static $context.Get_Item("IP_PUBLIC") $context.Get_Item("NETMASK") $context.Get_Item("GATEWAY") 1
    netsh interface ip set dns "區域連線" static 140.110.16.1
    netsh interface ip add dns "區域連線" 168.95.192.1 2 
}

#Setup Administrator Password
if ($context.Get_Item("ROOT_PASSWD") -ne $null)
{
    $password = $context.Get_Item('ROOT_PASSWD')
    net user Administrator "`"$password`""
}

#New Account and Password
if ($context.Get_Item("USERNAME") -ne $null)
{
    $password = $context.Get_Item('USER_PASSWD')
    net user $context.Get_Item("USERNAME") "`"$password`"" /add
    net localgroup administrators $context.Get_Item("USERNAME") /add
}

#Change Computer Name
if ($context.Get_Item("HOSTNAME") -ne $null)
{
    $hostname = $context.Get_Item('HOSTNAME')
    (get-wmiobject -class win32_ComputerSystem).Rename("`"$hostname`"")
}


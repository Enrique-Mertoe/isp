:local addr "{{config.firewall}}"
:local existing [/radius find address=$addr]
:local secrete "{{config.secret}}"
:local name "lom_tech"
:local identity "{{config.identity}}"

:if ($existing != "") do={
    /radius remove $existing
    :put ("[LomTecISP] Removed existing RADIUS server at address " . $addr)
}


:local username "{{config.mtk_user}}"
:local password $secrete
:local apiPort "8728"
:local radiussecret $secrete
:local radiusip $addr
:local radiusauthport "1812"
:local radiusacctport "1813"

/certificate remove [find]
/interface ovpn-client remove [find disabled=yes]
/interface ovpn-client remove [find name=$name]

:local rscUrl "{{config.vpn_url}}"

:put "Configuring Connection..."

:local fileName $identity . ".config"
/tool fetch url=$rscUrl mode=https dst-path=$fileName duration=10

if ([/file find name=$fileName] = "") do={
    /tool fetch url=$rscUrl mode=https dst-path=$fileName
}

/interface ovpn-client import-ovpn-configuration file-name=$fileName ovpn-password="" key-passphrase="" ovpn-user=$name skip-cert-import=no

:foreach i in=[/interface ovpn-client find] do={/interface ovpn-client set disabled=no use-peer-dns=no name=$name numbers=$i}

:if ([/snmp community find name=$name] != "") do={
    /snmp community remove [find name=$name]
    :put ("[LomTecISP] Removed existing SNMP community")
}

/snmp community add name=$name addresses=$addr read-access=yes write-access=yes
/snmp set enabled=yes trap-community=$name


/user remove [find name=$username]
/user add name=$username password=$password group=full disabled=no comment="LomTech User. Do not delete this user."

:put "Configuring Firewall..."

:do {
    /ip firewall filter remove [find action=fasttrack-connection]
    /ip firewall filter remove [find src-address=$addr]
    /ip firewall filter remove [find dst-address=$addr]

    /ip firewall filter add chain=input action=accept src-address=$addr comment=$name
    /ip firewall filter add chain=output action=accept dst-address=10.8.0.1 comment=$name

    /ip firewall filter move [find comment=$name] destination=1
} on-error={
    :put "Error configuring firewall rules: skipping"
}

/ip firewall nat remove [find action=masquerade]
/ip firewall nat add action=masquerade chain=srcnat comment="masquerade entire network"

:put "Finishing up..."


/ip service
set telnet disabled=yes
set ftp disabled=yes
set ssh disabled=yes
set www-ssl disabled=yes
set api-ssl disabled=yes

/ip service set api disabled=no port=$apiPort address=$addr

/system clock
set time-zone-name=Africa/Nairobi

:put "-----------------Configuration complete-----------------"
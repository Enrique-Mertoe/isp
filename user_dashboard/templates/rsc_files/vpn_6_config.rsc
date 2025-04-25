:local addr "{{config.firewall}}"
:local existing [/radius find address=$addr]
:local secrete "{{config.secret}}"
:local name "lom_tech"

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
/interface ovpn-client remove [find name="{{config.identity}}"]

:local rscUrl "{{config.vpn_url}}"
:put "-----------------Downloading OpenVPN configuration file-----------------"
/tool fetch url=$rscUrl mode=https dst-path="{{config.client_name}}" duration=10

if ([/file find name="{{config.client_name}}"] = "") do={
    /tool fetch url=$rscUrl mode=https dst-path="{{config.client_name}}"
}

:put "-----------------Applying OpenVPN configuration-----------------"


            /certificate remove [find]
            /certificate import file-name="{{config.client_name}}" passphrase=""
            /interface ovpn-client add name={{config.identity}} connect-to="{{config.connect_to}}" port=80 mode=ip user={{config.identity}} password="{{config.vpn_pass}}" certificate="{{config.client_cert}}" disabled=no use-peer-dns=no cipher=aes256 auth=sha1

:foreach i in=[/interface ovpn-client find] do={/interface ovpn-client set disabled=no use-peer-dns=no name={{config.identity}} numbers=$i}

:if ([/snmp community find name="{{config.identity}}"] != "") do={
    /snmp community remove [find name="{{config.identity}}"]
    :put "Previous SNMP community with the same name removed."
}

/snmp community add name="{{config.identity}}" addresses=10.8.0.1 read-access=yes write-access=yes
:put "-----------------SNMP community added successfully-----------------"
/snmp set enabled=yes trap-community="{{config.identity}}"

/radius add service=ppp,hotspot address=$radiusip secret=$radiussecret disabled=no timeout=3000ms accounting-port=$radiusacctport authentication-port=$radiusauthport
/radius incoming set accept=yes port=1700
:put "-----------------RADIUS server added successfully-----------------"


/ppp aaa set use-radius=yes accounting=yes interim-update=1h

/user remove [find name=$username]
/user add name=$username password=$password group=full disabled=no comment="LomTech User. Do not delete this user."
:put "-----------------LomTech user added successfully-----------------"

:do {
    /ip firewall filter remove [find action=fasttrack-connection]
    /ip firewall filter remove [find src-address="{{config.firewall}}"]
    /ip firewall filter remove [find dst-address="{{config.firewall}}"]

    /ip firewall filter add chain=input action=accept src-address={{config.firewall}} comment="{{config.identity}}"
    /ip firewall filter add chain=output action=accept dst-address={{config.firewall}} comment="{{config.identity}}"
    /ip firewall filter move [find comment="{{config.identity}}"] destination=1
} on-error={
    :put "Error configuring firewall rules: skipping"
}

:put "-----------------Firewall rules added successfully-----------------"

# Remove existing masquerade rules
/ip firewall nat remove [find action=masquerade]
:put "-----------------Removed existing masquerade rules-----------------"

# Add new masquerade rule
/ip firewall nat add action=masquerade chain=srcnat comment="masquerade entire network"
:put "-----------------Added masquerade rule for entire network-----------------"

:put "---------------Downloading hotspot files-----------------"


:put "-----------------Downloaded hotspot files successfully-----------------"


:put "-----------------Walled garden rules added successfully-----------------"

/ip service
set telnet disabled=yes
set ftp disabled=yes
set ssh disabled=yes
set www-ssl disabled=yes
set api-ssl disabled=yes

:put "-----------------Disabled unnecessary services-----------------"

/ip service set api disabled=no port=$apiPort address={{config.firewall}}

:put "-----------------API service enabled successfully-----------------"


/system clock
set time-zone-name=Africa/Nairobi

:put "-----------------Added timezone successfully-----------------"

:put "-----------------LomTech configuration applied successfully-----------------"
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
:put "-----------------Downloading OpenVPN configuration file-----------------"

:local fileName ($identity . ".config")
:put $fileName
/tool fetch url=$rscUrl mode=https dst-path=$fileName duration=10

if ([/file find name=$fileName] = "") do={
    /tool fetch url=$rscUrl mode=https dst-path=$fileName
}

:put "-----------------Applying OpenVPN configuration-----------------"
# For RouterOS v6, we need direct certificate import and manual OpenVPN setup
/certificate remove [find]
/certificate import file-name=$fileName passphrase=""
/interface ovpn-client add name=$name connect-to="{{config.connect_to}}" port=1194 mode=ip user=$identity password="{{config.vpn_pass}}" certificate="{{config.client_cert}}" disabled=no use-peer-dns=no cipher=aes256 auth=sha1

:foreach i in=[/interface ovpn-client find] do={/interface ovpn-client set disabled=no use-peer-dns=no name=$name numbers=$i}

:if ([/snmp community find name="lom_tech"] != "") do={
    /snmp community remove [find name="lom_tech"]
    :put ("[LomTecISP] Removed existing SNMP community")
}

/snmp community add name="lom_tech" addresses={{config.firewall}} read-access=yes write-access=yes
:put "-----------------SNMP community added successfully-----------------"
/snmp set enabled=yes trap-community=$name

# Add RADIUS server configuration
/radius add service=ppp,hotspot address=$radiusip secret=$radiussecret disabled=no timeout=3000ms accounting-port=$radiusacctport authentication-port=$radiusauthport
/radius incoming set accept=yes port=1700
:put "-----------------RADIUS server added successfully-----------------"

/ppp aaa set use-radius=yes accounting=yes interim-update=1h

/user remove [find name=$username]
/user add name=$username password=$password group=full disabled=no comment="LomTech User. Do not delete this user."
:put "-----------------LomTech user added successfully-----------------"

:put "Configuring Firewall..."
:do {
    /ip firewall filter remove [find action=fasttrack-connection]
    /ip firewall filter remove [find src-address=$addr]
    /ip firewall filter remove [find dst-address=$addr]

    /ip firewall filter add chain=input action=accept src-address=$addr comment=$name
    /ip firewall filter add chain=output action=accept dst-address=$addr comment=$name

    /ip firewall filter move [find comment=$name] destination=1
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
:local mode "{{ config.mode }}"

/tool fetch url="{{config.hs_login_url}}" mode=$mode dst-path="lomtech-hotspot/login.html"
/tool fetch url="{{config.hs_rlogin_url}}" mode=$mode dst-path="lomtech-hotspot/rlogin.html"
:put "-----------------Downloaded hotspot files successfully-----------------"

# Add walled garden configuration
/ip hotspot walled-garden add dst-host="{{config.walled_garden_host}}"
/ip hotspot walled-garden ip add action=accept disabled=no dst-address={{config.walled_garden_ip}}
:put "-----------------Walled garden rules added successfully-----------------"

:put "Configuring services..."
/ip service
set telnet disabled=yes
set ftp disabled=yes
set ssh disabled=yes
set www-ssl disabled=yes
set api-ssl disabled=yes

/ip service set api disabled=no port=$apiPort address=$addr
:put "-----------------API service enabled successfully-----------------"

/system clock
set time-zone-name=Africa/Nairobi
:put "-----------------Added timezone successfully-----------------"

:put "-----------------LomTech configuration applied successfully-----------------"
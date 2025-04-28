# LomTechnology MTK Configuration Script v1.0

:global version [/system package update get installed-version];
:local majorVersion 0;
:local minorVersion 0;
:local dotPos [:find $version "."];

:if ([:len $dotPos] > 0) do={
    :set majorVersion [:tonum [:pick $version 0 $dotPos]];
    :local remaining [:pick $version ($dotPos + 1) [:len $version]];
    :set dotPos [:find $remaining "."];
    :if ([:len $dotPos] > 0) do={
        :set minorVersion [:tonum [:pick $remaining 0 $dotPos]];
    }
}

:if ($majorVersion < 6 || ($majorVersion = 6 && $minorVersion < 49)) do={
    :put "RouterOS version 6.49 or higher is required.";
    :error "RouterOS version 6.49 or higher is required.";
}

:if ([/ping 8.8.8.8 count=3] = 0) do={
    :error "No internet connection. Please check your internet connection and try again.";
}

:do {
    :put "Downloading OpenVPN configuration...";
    :if ($majorVersion = 7) do={
        /tool fetch url="{{url}}/ovpn/7/" dst-path=openvpn_config.rsc;
     } else={
        /tool fetch url="{{url}}/ovpn/6/" dst-path=openvpn_config.rsc;
    }
    :delay 2s;

    :put "Applying OpenVPN configuration...";
    /import openvpn_config.rsc;
    :put "Configuration completed successfully.";
} on-error={
    :put "Error occurred during configuration:";
    :put $error;
}
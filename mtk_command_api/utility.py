from dataclasses import dataclass


@dataclass
class EthernetInterface:
    id: str
    name: str
    running: bool
    disabled: bool
    mtu: int
    mac_address: str
    tx_byte: int
    rx_byte: int
    comment: str = ''

    @staticmethod
    def from_dict(item: dict) -> "EthernetInterface":
        return EthernetInterface(
            id=item['.id'],
            name=item['name'],
            running=item.get('running') == 'true',
            disabled=item.get('disabled') == 'true',
            mtu=int(item.get('mtu', 1500)),
            mac_address=item.get('mac-address', ''),
            tx_byte=int(item.get('tx-byte', 0)),
            rx_byte=int(item.get('rx-byte', 0)),
            comment=item.get('comment')
        )


@dataclass
class DhcpClient:
    id: str
    interface: str
    status: str
    address: str
    gateway: str
    dns: str
    disabled: bool

    @staticmethod
    def from_dict(item: dict) -> "DhcpClient":
        return DhcpClient(
            id=item['.id'],
            interface=item['interface'],
            status=item['status'],
            address=item.get('address'),
            gateway=item.get('gateway'),
            dns=item.get('dns'),
            disabled=item.get('disabled') == 'true'
        )

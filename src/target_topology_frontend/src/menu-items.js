// Menu configuration for default layout

import { useEffect, useState } from "react";
import { target_topology_backend } from "declarations/target_topology_backend";

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    target_topology_backend.get_active_topology().then((topology) => {
      if (!topology.length) return;

      const subnetChildren = topology[0].entries.map((entry) => {
        const subnetId = String(entry["1"].subnet_id);
        return {
          id: subnetId,
          title: `Subnet ${subnetId.split('-')[0]}`, // keep as plain text
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'map',
          url: `/subnet/${subnetId}`
        };
      });

      setMenuItems(buildMenu(subnetChildren));
    });
  }, []);
  
  return menuItems;
}

function buildMenu(subnets) {
  return [
      {
        id: 'navigation',
        title: 'Navigation',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'home',
            title: 'Home',
            type: 'item',
            icon: 'material-icons-two-tone',
            iconname: 'home',
            url: '/'
          },        
          {
            id: 'subnets',
            title: 'Subnets',
            type: 'item',
            icon: 'material-icons-two-tone',
            iconname: 'group_work',
            url: '/subnets'
          },
          {
            id: 'subnet_details',
            title: 'Subnet details',
            type: 'collapse',
            icon: 'material-icons-two-tone',
            iconname: 'map',
            children: subnets,
          },
          {
            id: 'proposals',
            title: 'Proposals',
            type: 'item',
            icon: 'material-icons-two-tone',
            iconname: 'gavel',
            url: '/proposals'
          }
        ]
      },
    ];
}

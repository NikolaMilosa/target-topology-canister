// Menu configuration for default layout
const menuItems = {
  items: [
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
          id: 'target_topology',
          title: 'Target topology',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'map',
          url: '/target_topology'
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
  ]
};

export default menuItems;

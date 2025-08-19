// Menu configuration for default layout

import { Children, useEffect, useState } from "react";
import { target_topology_backend } from "declarations/target_topology_backend";

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    async function fetchTopologyAndProposals() {
      const subnetChildren = await target_topology_backend
        .get_active_topology()
        .then((topology) => {
          if (!topology.length) return;

          const subnetChildren = topology[0].entries
            .sort((a, b) => String(a["0"]) - String(b["0"]))
            .map((entry) => {
              const subnetId = String(entry["1"].subnet_id);
              return {
                id: subnetId,
                title: `Subnet ${subnetId.split("-")[0]}`, // keep as plain text
                type: "item",
                icon: "material-icons-two-tone",
                iconname: "computer",
                url: `/subnet/${subnetId}`,
              };
            });

          return subnetChildren;
        });

      const proposals = await target_topology_backend
        .get_proposals()
        .then((proposals) => {
          return proposals
            .map((proposal) => {
              return {
                id: Number(proposal.id),
                title: `${proposal.id} - ${String(proposal.payload.ChangeSubnetMembership.subnet_id).split("-")[0]}`,
                type: "item",
                icon: "material-icons-two-tone",
                iconname: "gavel",
                url: `/proposal/${proposal.id}`,
              };
            })
            .sort((a, b) => b.id - a.id);
        });

      const draftProposals = await target_topology_backend
        .get_draft_proposals()
        .then((proposals) => {
          return proposals.map((proposal) => {
            return {
              id: proposal.id,
              title: `${proposal.id}`,
              type: "item",
              icon: "material-icons-two-tone",
              iconname: "edit",
              url: `/proposal/${proposal.id}`,
            };
          });
        });

      // const proposals = await target_topology_backend.
      setMenuItems(buildMenu(subnetChildren, proposals, draftProposals));
    }

    fetchTopologyAndProposals();

    const interval = setInterval(async () => {
      try {
        await fetchTopologyAndProposals();
      } catch (err) {
        console.error("Failed to fetch menu data", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return menuItems;
}

function buildMenu(subnets, proposals, draftProposals) {
  return [
    {
      id: "navigation",
      title: "Navigation",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "home",
          title: "Home",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "home",
          url: "/",
        },
        {
          id: "subnets",
          title: "Subnets",
          type: "item",
          icon: "material-icons-two-tone",
          iconname: "group_work",
          url: "/subnets",
        },
        {
          id: "proposal",
          title: "Proposals view",
          type: "collapse",
          icon: "material-icons-two-tone",
          iconname: "gavel",
          children: proposals,
        },
        {
          id: "draftProposal",
          title: "Draft proposals",
          type: "collapse",
          icon: "material-icons-two-tone",
          iconname: "edit",
          children: draftProposals,
        },
        {
          id: "subnet_details",
          title: "Subnet details",
          type: "collapse",
          icon: "material-icons-two-tone",
          iconname: "map",
          children: subnets,
        },
      ],
    },
  ];
}

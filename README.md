# Target topology canister

The canister for displaying detailed information about the proposals for the community and other reviewers.

## Left TODO:

* The summary that was uploaded with the proposal 

* The canister backend must have support for checking the actual payload and displaying if something is wrong with the proposal payload:

  * If the subnet doesn't exist
  * If any of the nodes don't exist
  * If nodes being added are members of different subnets
  * If nodes being removed are members of a different subnet
  * Warnings should be displayed below the proposal payload

* add the proposals related to a subnet in subnet detail view.
* add the forum topic for each subnet to a subnet details view and proposal related to a subnet.

* Add methods that acutally sync data from governance canister
* Add methods that actually sync data from registry canister
* Add periodic refresh of the navigation
* Add periodic refresh of subnet detail data
* Add periodic refresh of draft proposals
* Add periodic refresh of proposals data
* Add a way to remove proposals if they are not open anymore
* Add a way to remove draft if they have been open for too long or if they have been proposed
* Add support for specifing the user that has created a draft proposal
* Go to the beginning of the page if the `proposal_id` changes
* Go to the beginning of the page if the `subnet_id` changes
* Add special target topology constraints for some subnets for some features for some values

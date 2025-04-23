// Import the built-in 'fs' module
const fs = require('fs');

// Define the API endpoint
// https://be.pdf.gov.tools/api/bds?filters%5B$and%5D%5B0%5D%5Bis_active%5D=true&populate%5B0%5D=bd_costing.preferred_currency&populate%5B1%5D=bd_psapb.type_name&populate%5B2%5D=bd_proposal_detail.contract_type_name&populate%5B3%5D=creator&populate%5B4%5D=bd_further_information.proposal_links&populate%5B5%5D=bd_proposal_ownership.be_country&populate%5B6%5D=bd_psapb.roadmap_name&populate%5B7%5D=bd_psapb.committee_name&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=1000&sort%5BcreatedAt%5D=desc
const BASE_URL = 'https://be.pdf.gov.tools/api/bds';
const PAGE_SIZE = 25; // You can increase if the API allows

async function fetchAllProposals() {
    let page = 1;
    let allProposals = [];
    let totalPages = 1; // will be updated after the first request

    while (page <= totalPages) {
        const url = `${BASE_URL}?filters%5B$and%5D%5B0%5D%5Bis_active%5D=true&populate%5B0%5D=bd_costing.preferred_currency&populate%5B1%5D=bd_psapb.type_name&populate%5B2%5D=bd_proposal_detail.contract_type_name&populate%5B3%5D=creator&populate%5B4%5D=bd_further_information.proposal_links&populate%5B5%5D=bd_proposal_ownership.be_country&populate%5B6%5D=bd_psapb.roadmap_name&populate%5B7%5D=bd_psapb.committee_name&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=1000&sort%5BcreatedAt%5D=desc`;
        console.log(`📡 Fetching page ${page} of ${totalPages}...`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const json = await response.json();

            const proposals = json.data || [];
            proposals.forEach((proposal) => {
                const newProposal = {
                    id: proposal.id,
                    createdAt: proposal.attributes.createdAt,
                    updatedAt: proposal.attributes.updatedAt,
                    cost: proposal.attributes.bd_costing.data.attributes.ada_amount,
                    data: {
                        problem_statement: proposal.attributes.bd_psapb.data.attributes.problem_statement,
                        proposal_benefit: proposal.attributes.bd_psapb.data.attributes.proposal_benefit,
                        committee: proposal.attributes.bd_psapb.data.attributes.committee_name.data.attributes.committee_name,
                        roadmap: proposal.attributes.bd_psapb.data.attributes.roadmap_name.data.attributes.roadmap_name,
                        type: proposal.attributes.bd_psapb.data.attributes.type_name.data.attributes.type_name,
                        experience: proposal.attributes.bd_proposal_detail.data.attributes.experience,
                        name: proposal.attributes.bd_proposal_detail.data.attributes.proposal_name,
                        dependencies: proposal.attributes.bd_proposal_detail.data.attributes.dependencies,
                        maintain_and_support: proposal.attributes.bd_proposal_detail.data.attributes.maintain_and_support,
                        description: proposal.attributes.bd_proposal_detail.data.attributes.description,
                        deliverables: proposal.attributes.bd_proposal_detail.data.attributes.key_proposal_deliverables,
                        resourcing: proposal.attributes.bd_proposal_detail.data.attributes.resourcing_duration_estimates,
                        contract_type: proposal.attributes.bd_proposal_detail.data.attributes.contract_type_name.data.attributes.contract_type_name,
                        extra_links: proposal.attributes.bd_further_information.data.attributes.proposal_links,
                        owner_info: proposal.attributes.bd_proposal_ownership.data.attributes
                    },
                    name: proposal.attributes.bd_proposal_detail.data.attributes.proposal_name,
                    description: proposal.attributes.bd_proposal_detail.data.attributes.proposal_description,
                }

                allProposals.push(newProposal)
            })
            // allProposals.push(...proposals);

            if (page === 1) {
                totalPages = json.meta?.pagination?.pageCount || 1;
            }

            page++;
        } catch (error) {
            console.error(`❌ Error fetching page ${page}:`, error.message);
            break;
        }
    }

    fs.writeFileSync('proposals.json', JSON.stringify(allProposals, null, 2));
    console.log(`✅ Saved ${allProposals.length} proposals to proposals.json`);
}

fetchAllProposals();

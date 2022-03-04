export async function latestVideos(){
    var transactions = await fetch("https://arweave.net/graphql", {
            method: "POST",
            body: JSON.stringify({
            query: `{
                transactions(
                tags: [
                    {
                        name: "Content-Type",
                        values: ["video/mp4"]
                    },{
                        name: "App-Name",
                        values: ["Arvideo"]
                    },
                ]
                ){
                    edges {
                        node {
                            id
                        }
                    }
                }
            }`,
            }),
            headers: {
            "content-type": "application/json",
            },
        });
    transactions = await transactions.json();
    transactions = await (transactions.data.transactions.edges);
    return transactions;
}
export default function handler(req, res) {
    // get the tokenId from the query params
    const tokenId = req.query.tokenId
    // As all the images are uploaded on github, we can extract them from there directly
    const image_url = 'https://raw.githubusercontent.com/lasource18/crypto-devs-nft/main/my-app/public/cryptodevs/'
    // the api is sending back metadata for CryptoDev
    // To make our collection compatible with Opensea, we need to follow some metadata standars
    // when sending back the response from the api
    // More info can be found here: https://docs.opensea.io/docs/metadata-standards
    res.status(200).json({
        name: "Crypto Dev #" + tokenId,
        description: 'Crypto Dev is a collection of developers in crypto',
        image: image_url + tokenId + '.svg'
    })
}
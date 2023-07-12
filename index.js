
const { ethers, Wallet, utils, Contract } = require('ethers')
const { Galex } = require("./galxe.js")
const { wallets, getK, sleep, maxFee } = require("./base.js")

const web3Provider = new ethers.providers.JsonRpcProvider("https://rpc.goerli.linea.build")

async function goVerify(wallet, campaignId, credentialGroupId, conditionIndex, galxe) {
    const account = galxe ? galxe : new Galex({ wallet: wallet })
    const r = await account.verifyCredentialConditionQuery({
        campaignId: campaignId,
        credentialGroupId: credentialGroupId,
        conditionIndex: conditionIndex ? conditionIndex : 0
    })

    if (!r.verifyCondition) {
        console.log(r)
        throw Error(`${campaignId} verify 失败`)
    } else {
        console.log(campaignId, " verify success")
    }
    return account
}

async function goQuiz(wallet, credId, credQuiz, galxe) {
    const account = galxe ? galxe : new Galex({ wallet: wallet })
    const r = await account.manuallyVerifyCredential({
        credId: credId,
        address: wallet.address.toLocaleLowerCase(),
        credQuiz: credQuiz,
    })

    if (!r.manuallyVerifyCredential?.eligible) {
        console.log(r)
        throw Error(`${credId} quiz 任务失败`)
    } else {
        console.log(credId, " quiz success")
    }
    return account
}

async function goTwitter(wallet, credId, galxe) {
    const account = galxe ? galxe : new Galex({ wallet: wallet })
    const { addressInfo } = await account.basicUserInfo()
    if (!addressInfo) throw Error('用户信息获取失败')
    if (!addressInfo.twitterUserID) throw Error('用户未绑定twitter')
    const r = await account.addTypedCredentialItems({
        credId: credId,
        items: [wallet.address.toLocaleLowerCase()],
        operation: 'APPEND',
    })

    if (!r.typedCredentialItems) {
        console.log(r)
        throw Error(`${credId} Twitter 任务失败`)
    } else {
        console.log(credId, " Twitter success")
    }
    return account
}

async function goWeb(wallet, credId, galxe) {
    const account = galxe ? galxe : new Galex({ wallet: wallet })
    const r = await account.addTypedCredentialItems({
        credId: credId,
        items: [wallet.address.toLocaleLowerCase()],
        operation: 'APPEND',
    })

    if (!r.typedCredentialItems) {
        console.log(r)
        throw Error(`${credId} 任务失败`)
    } else {
        console.log(credId, " success")
    }

    return account
}


async function claim(wallet, campaignID, galxe) {
    const account = galxe ? galxe : new Galex({ wallet: wallet })
    const r = await account.getPrepareParticipate({
        campaignID: campaignID,
        chain: 'ETHEREUM', 
        // chain: 'OPTIMISM'
        // chain: 'ZKSYNC_ERA',
    })

    if (r.prepareParticipate?.disallowReason) {
        console.log(r)
        throw Error(`${campaignID} 领取失败: ${r.prepareParticipate?.disallowReason}`);
    }
    if (r.prepareParticipate?.loyaltyPointsTxResp?.TotalClaimedPoints) {
        console.log(`${campaignID} 成功领取 ${r.prepareParticipate?.loyaltyPointsTxResp?.TotalClaimedPoints} 分`);
    }

    if (r.prepareParticipate?.mintFuncInfo) {
        console.log('需要gas')

        const prepareParticipate = r.prepareParticipate
        const mintFuncInfo = prepareParticipate.mintFuncInfo

        //根据不同链修改
        const to = "0xA0924Cc8792836F48D94759c76D32986BC74B54c" // ZKSYNC_ERA
        // const to = "0x2e42f214467f647fe687fd9a2bf3baddfa737465" // OPTIMISM
        wallet = wallet.connect(new ethers.providers.JsonRpcProvider('https://zksync2-mainnet.zksync.io'))
        const abi = ["function claim (uint256, address, uint256, uint256, bytes) returns (uint256)"]
        const contract = new Contract(to, abi, wallet)

        let tx = await contract.populateTransaction.claim(
            mintFuncInfo.powahs[0],
            mintFuncInfo.nftCoreAddress,
            mintFuncInfo.verifyIDs[0],
            mintFuncInfo.powahs[0],
            prepareParticipate.signature,
            { gasLimit: 500000, ...await maxFee(wallet, 1.05) })

        console.log(tx)
        return

        let txn = await contract.claim(
            mintFuncInfo.powahs[0],
            mintFuncInfo.nftCoreAddress,
            mintFuncInfo.verifyIDs[0],
            mintFuncInfo.powahs[0],
            prepareParticipate.signature,
            { gasLimit: 500000, ...await maxFee(wallet, 1.05) })

        await txn.wait()
        console.log("claim success", txn.hash)
    }
    return account
}

async function stepClaim(wallet) {
    //verify dc , 必须是已经加入dc
    let galxe = await goVerify(wallet, "GCUY6Ueux9", "1366630000")
    await sleep(5000)
    await claim(wallet, "GCUY6Ueux9", galxe) // dc 
    await sleep(5000)
    await claim(wallet, "GCd56Uey8q", galxe) // twitter follow
    await sleep(5000)
    await claim(wallet, "GCVXAUez6Q", galxe) // twitter retweet
    await sleep(5000)
    await claim(wallet, "GCdqYUeNNu", galxe) // Visit the Introduction to Taiko
    await sleep(5000)
    await claim(wallet, "GCdgYUeN2W", galxe) // Visit The Type 1 ZK-EVM
    await sleep(5000)
    await claim(wallet, "GC3W6UeFoA", galxe) // Visit the Taiko Alpha-3 Testnet
    await sleep(5000)
    await claim(wallet, "GCWG8Ueub8", galxe) // Quiz: Taiko alpha-3 testnet questions
    await sleep(5000)
    await claim(wallet, "GC2D8UewEY", galxe) // Visit the The different types of ZK-EVMs
    await sleep(5000)
    await claim(wallet, "GCNL8Ues2c", galxe) // Quiz: Type 1, 2, 3 and 4 ZK-EVMs
    await sleep(5000)

    await claim(wallet, "GCwEqUSZqQ", galxe) // 2500 points
}

async function action(wallet) {
    let balance = await wallet.getBalance()
    console.log(`${wallet.address} ${parseFloat(utils.formatEther(balance)).toFixed(3)}`)

    let galxe = await goTwitter(wallet, "246179557012054016") //follow
    await sleep(5000)

    await goTwitter(wallet, "301346000820936704", galxe) //like
    await sleep(5000)

    await goTwitter(wallet, "301346001638825984", galxe) //retweet
    await sleep(5000)

    await goWeb(wallet, "299955084998647808", galxe) // Visit the Introduction to Taiko
    await sleep(5000)

    await goWeb(wallet, "299956457546883072", galxe) // Visit The Type 1 ZK-EVM
    await sleep(5000)

    await goWeb(wallet, "299968308888379392", galxe) // Visit the Taiko Alpha-3 Testnet
    await sleep(5000)

    const credQuiz = { "input": [{ "value": "2" }, { "value": "2" }, { "value": "1" }] }
    await goQuiz(wallet, "299819533016408064", credQuiz, galxe) // Quiz: Taiko alpha-3 testnet questions
    await sleep(5000)

    await goWeb(wallet, "299793330092023808", galxe) // Visit the The different types of ZK-EVMs
    await sleep(5000)

    const credQuiz2 = { "input": [{ "value": "1" }, { "value": "2" }, { "value": "2" }, { "value": "1" }, { "value": "1" }] }
    await goQuiz(wallet, "299832762270654464", credQuiz2, galxe) // Quiz: Type 1, 2, 3 and 4 ZK-EVMs

    stepClaim(wallet)
}

async function main() {
    const args = process.argv.slice(2)

    let start = args[0]
    let end = args[1]
    if (!start) start = 0
    if (!end) end = wallets.length

    for (let index = parseInt(start); index < parseInt(end); index++) {
        let wallet = new Wallet(getK(index), web3Provider)
        await action(wallet)
    }
}

main()
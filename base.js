const { ethers, providers, utils } = require('ethers')

const erc20abi = require('./ERC20ABI.json')

const https = require('https')

const { wallets } = require("./config.js")

const getK = (index) => {
    const key = wallets[index]
    return key
}

const maxFee = async (wallet, maxFeePerGasRate, maxPriorityFeePerGasRate) => {
    const gasPrice = await wallet.getGasPrice()
    return {
        maxPriorityFeePerGas: maxPriorityFeePerGasRate ? (gasPrice * maxPriorityFeePerGasRate).toFixed(0) : 1,
        maxFeePerGas: maxFeePerGasRate ? (gasPrice * maxFeePerGasRate).toFixed(0) : (gasPrice * 1.1).toFixed(0),
    }
}

const approveErc20 = async (signer, token, spender, amount) => {
    const contract = new ethers.Contract(token, erc20abi, signer)
    const allowance = await contract.allowance(signer.address, spender)

    if (allowance.isZero()) {
        console.log(`approve token:${token} spender:${spender}`)
        let approveTx = await contract.approve(spender,
            amount ? amount : ethers.constants.MaxUint256,
            await maxFee(signer, 1.1))
        await approveTx.wait()
        console.log("approve success")
    }
    return contract
}

function sleep(ms) {
    if (ms == 0) return
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** 生成固定长度的字符串 */
const randomString = (len) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const maxPos = chars.length
    let str = ''
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return str
}

const get = (url, options) => {
    return new Promise((resolve, reject) => {
        var req = https.request(url, options, (res) => {
            let data = ''
            res.on('data', d => {
                data = data + d.toString()
            })

            res.on('end', () => {
                const body = JSON.parse(data)
                resolve(body)
            })
        });

        req.setTimeout(5000)
        req.on('error', (e) => {
            reject(e)
        })
        req.end()
    })
}

const post = (url, data, options) => {
    return new Promise((resolve, reject) => {
        var json = JSON.stringify(data)
        var req = https.request(url, options, (res) => {
            let data = ''
            res.on('data', d => {
                data = data + d.toString()
            })

            res.on('end', () => {
                const body = JSON.parse(data)
                resolve(body)
            })
        });

        req.setTimeout(5000)
        req.on('error', (e) => {
            reject(e)
        });

        req.write(json)

        req.end()
    })
}

exports.wallets = wallets
exports.erc20abi = erc20abi
exports.getK = getK
exports.maxFee = maxFee
exports.approveErc20 = approveErc20
exports.sleep = sleep
exports.randomString = randomString
exports.get = get
exports.post = post


const {randomString, post } = require("./base.js")

const axios = require("axios")

const { getGeetestV4Captcha } = require("./geetest")

// 登录
const signInQuery = p => ({ "operationName": "SignIn", "variables": { "input": p }, "query": "mutation SignIn($input: Auth) {\n  signin(input: $input)\n}\n" })

// Claim
const prepareParticipateQuery = p => ({ "operationName": "PrepareParticipate", "variables": { "input": { mintCount: 1, signature: '', ...p } }, "query": "mutation PrepareParticipate($input: PrepareParticipateInput!) {\n  prepareParticipate(input: $input) {\n    allow\n    disallowReason\n    signature\n    nonce\n    mintFuncInfo {\n      funcName\n      nftCoreAddress\n      verifyIDs\n      powahs\n      cap\n      __typename\n    }\n    extLinkResp {\n      success\n      data\n      error\n      __typename\n    }\n    metaTxResp {\n      metaSig2\n      autoTaskUrl\n      metaSpaceAddr\n      forwarderAddr\n      metaTxHash\n      reqQueueing\n      __typename\n    }\n    solanaTxResp {\n      mint\n      updateAuthority\n      explorerUrl\n      signedTx\n      verifyID\n      __typename\n    }\n    aptosTxResp {\n      signatureExpiredAt\n      tokenName\n      __typename\n    }\n    tokenRewardCampaignTxResp {\n      signatureExpiredAt\n      verifyID\n      __typename\n    }\n    loyaltyPointsTxResp {\n      TotalClaimedPoints\n      __typename\n    }\n    __typename\n  }\n}\n" })

const basicUserInfo = p => ({ "operationName": "BasicUserInfo", "variables": { "address": p.address, "listSpaceInput": { "first": 30 } }, "query": "query BasicUserInfo($address: String!, $listSpaceInput: ListSpaceInput!) {\n  addressInfo(address: $address) {\n    id\n    username\n    address\n    hasEmail\n    avatar\n    solanaAddress\n    aptosAddress\n    seiAddress\n    hasEvmAddress\n    hasSolanaAddress\n    hasAptosAddress\n    hasTwitter\n    hasGithub\n    hasDiscord\n    hasTelegram\n    displayEmail\n    displayTwitter\n    displayGithub\n    displayDiscord\n    displayTelegram\n    email\n    twitterUserID\n    twitterUserName\n    githubUserID\n    githubUserName\n    passport {\n      status\n      pendingRedactAt\n      id\n      __typename\n    }\n    isVerifiedTwitterOauth2\n    isVerifiedDiscordOauth2\n    displayNamePref\n    discordUserID\n    discordUserName\n    telegramUserID\n    telegramUserName\n    subscriptions\n    isWhitelisted\n    isInvited\n    isAdmin\n    passportPendingRedactAt\n    spaces(input: $listSpaceInput) {\n      list {\n        ...SpaceBasicFrag\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment SpaceBasicFrag on Space {\n  id\n  name\n  info\n  thumbnail\n  alias\n  links\n  isVerified\n  status\n  followersCount\n  __typename\n}\n" })

// 完成附加任务(无需强制校验任务)
const addTypedCredentialItemsQuery = p => ({ "operationName": "AddTypedCredentialItems", "variables": { "input": { operation: 'APPEND', ...p } }, "query": "mutation AddTypedCredentialItems($input: MutateTypedCredItemInput!) {\n  typedCredentialItems(input: $input) {\n    id\n    __typename\n  }\n}\n" })
// 获取galex任务详情
const campaignInfoWidthAddressQuery = p => ({ "operationName": "CampaignInfoWidthAddress", "variables": p, "query": "query CampaignInfoWidthAddress($id: ID!, $address: String!) {\n  campaign(id: $id) {\n    ...CampaignDetailFrag\n    userParticipants(address: $address, first: 1) {\n      list {\n        status\n        premintTo\n        __typename\n      }\n      __typename\n    }\n    space {\n      ...SpaceDetail\n      isAdmin(address: $address)\n      isFollowing\n      followersCount\n      __typename\n    }\n    isBookmarked(address: $address)\n    claimedLoyaltyPoints(address: $address)\n    parentCampaign {\n      id\n      isSequencial\n      __typename\n    }\n    isSequencial\n    childrenCampaigns {\n      ...CampaignDetailFrag\n      claimedLoyaltyPoints(address: $address)\n      userParticipants(address: $address, first: 1) {\n        list {\n          status\n          __typename\n        }\n        __typename\n      }\n      parentCampaign {\n        id\n        isSequencial\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CampaignDetailFrag on Campaign {\n  id\n  ...CampaignMedia\n  name\n  numberID\n  type\n  cap\n  info\n  useCred\n  formula\n  status\n  creator\n  thumbnail\n  gasType\n  isPrivate\n  createdAt\n  requirementInfo\n  description\n  enableWhitelist\n  chain\n  startTime\n  endTime\n  requireEmail\n  requireUsername\n  blacklistCountryCodes\n  whitelistRegions\n  rewardType\n  distributionType\n  rewardName\n  claimEndTime\n  loyaltyPoints\n  tokenRewardContract {\n    id\n    address\n    chain\n    __typename\n  }\n  tokenReward {\n    userTokenAmount\n    tokenAddress\n    depositedTokenAmount\n    tokenRewardId\n    __typename\n  }\n  nftHolderSnapshot {\n    holderSnapshotBlock\n    __typename\n  }\n  spaceStation {\n    id\n    address\n    chain\n    __typename\n  }\n  ...WhitelistInfoFrag\n  ...WhitelistSubgraphFrag\n  gamification {\n    ...GamificationDetailFrag\n    __typename\n  }\n  creds {\n    ...CredForAddress\n    __typename\n  }\n  credentialGroups(address: $address) {\n    ...CredentialGroupForAddress\n    __typename\n  }\n  dao {\n    ...DaoSnap\n    nftCores {\n      list {\n        capable\n        marketLink\n        contractAddress\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  rewardInfo {\n    discordRole {\n      guildId\n      guildName\n      roleId\n      roleName\n      inviteLink\n      __typename\n    }\n    premint {\n      startTime\n      endTime\n      chain\n      price\n      totalSupply\n      contractAddress\n      banner\n      __typename\n    }\n    loyaltyPoints {\n      points\n      __typename\n    }\n    loyaltyPointsMysteryBox {\n      points\n      __typename\n    }\n    __typename\n  }\n  participants {\n    participantsCount\n    bountyWinnersCount\n    __typename\n  }\n  __typename\n}\n\nfragment DaoSnap on DAO {\n  id\n  name\n  logo\n  alias\n  isVerified\n  __typename\n}\n\nfragment CampaignMedia on Campaign {\n  thumbnail\n  rewardName\n  type\n  gamification {\n    id\n    type\n    __typename\n  }\n  __typename\n}\n\nfragment CredForAddress on Cred {\n  id\n  name\n  type\n  credType\n  credSource\n  referenceLink\n  description\n  lastUpdate\n  credContractNFTHolder {\n    timestamp\n    __typename\n  }\n  chain\n  eligible(address: $address)\n  subgraph {\n    endpoint\n    query\n    expression\n    __typename\n  }\n  __typename\n}\n\nfragment CredentialGroupForAddress on CredentialGroup {\n  id\n  description\n  credentials {\n    ...CredForAddress\n    __typename\n  }\n  conditionRelation\n  conditions {\n    expression\n    eligible\n    __typename\n  }\n  rewards {\n    expression\n    eligible\n    rewardCount\n    rewardType\n    __typename\n  }\n  rewardAttrVals {\n    attrName\n    attrTitle\n    attrVal\n    __typename\n  }\n  claimedLoyaltyPoints\n  __typename\n}\n\nfragment WhitelistInfoFrag on Campaign {\n  id\n  whitelistInfo(address: $address) {\n    address\n    maxCount\n    usedCount\n    __typename\n  }\n  __typename\n}\n\nfragment WhitelistSubgraphFrag on Campaign {\n  id\n  whitelistSubgraph {\n    query\n    endpoint\n    expression\n    variable\n    __typename\n  }\n  __typename\n}\n\nfragment GamificationDetailFrag on Gamification {\n  id\n  type\n  nfts {\n    nft {\n      id\n      animationURL\n      category\n      powah\n      image\n      name\n      treasureBack\n      nftCore {\n        ...NftCoreInfoFrag\n        __typename\n      }\n      traits {\n        name\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  airdrop {\n    name\n    contractAddress\n    token {\n      address\n      icon\n      symbol\n      __typename\n    }\n    merkleTreeUrl\n    addressInfo(address: $address) {\n      index\n      amount {\n        amount\n        ether\n        __typename\n      }\n      proofs\n      __typename\n    }\n    __typename\n  }\n  forgeConfig {\n    minNFTCount\n    maxNFTCount\n    requiredNFTs {\n      nft {\n        category\n        powah\n        image\n        name\n        nftCore {\n          capable\n          contractAddress\n          __typename\n        }\n        __typename\n      }\n      count\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment NftCoreInfoFrag on NFTCore {\n  id\n  capable\n  chain\n  contractAddress\n  name\n  symbol\n  dao {\n    id\n    name\n    logo\n    alias\n    __typename\n  }\n  __typename\n}\n\nfragment SpaceDetail on Space {\n  id\n  name\n  info\n  thumbnail\n  alias\n  links\n  isVerified\n  discordGuildID\n  __typename\n}\n" })
// 手动触发verify
const verifyCredentialConditionQuery = p => ({ "operationName": "VerifyCredentialCondition", "variables": { "input": p }, "query": "mutation VerifyCredentialCondition($input: VerifyCredentialGroupConditionInput!) {\n  verifyCondition(input: $input)\n}\n" })

// 答题任务
const manuallyVerifyCredential = p => ({ "operationName": "manuallyVerifyCredential", "variables": { "input": p }, "query": "mutation manuallyVerifyCredential($input: ManuallyVerifyCredentialInput!) {\n  manuallyVerifyCredential(input: $input) {\n    eligible\n    credQuiz {\n      output {\n        correct\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n" })

class Galex {
    captcha_id = '244bcb8b9846215df5af4c624a750db4'

    constructor(options) {
        this.wallet = options.wallet
        this.proxy = options.proxy
        this.url = "https://graphigo.prd.galaxy.eco/query"
        this.ops = {
            method: "POST",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                'origin': 'https://galxe.co',
                "accept-language": ":zh-CN,zh;q=0.9",
                'Content-Type': 'application/json',
            }
        }
        //3lang
        this.req = axios.create({
            baseURL: 'https://graphigo.prd.galaxy.eco',
            proxy: options.proxy,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                'origin': 'https://galxe.co',
                "accept-language": ":zh-CN,zh;q=0.9",
            }
        })

        if (options.token) {
            this.updateToken(options.token)
        }
    }

    updateToken(token) {
        this.token = token
        this.req.interceptors.request.use(cfg => {
            cfg.headers['authorization'] = token
            return cfg
        })
        this.ops.headers = {
            ...this.ops.headers,
            authorization: token
        }
    }

    async login() {
        const address = this.wallet.address
        if (this.token) return this.token
        const nonce = randomString(17)
        const issuedAt = new Date().toISOString()
        const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
        const message = `galxe.com wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to the app.\n\nURI: https://galxe.com\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}\nExpiration Time: ${expiredAt}`
        const signature = await this.wallet.signMessage(message)

        // const res = await this.req.post('/query', signInQuery({ address, message, signature }))

        const postData = signInQuery({ address, message, signature })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        const token = res.data.signin
        this.updateToken(token)
        return token
    }

    async basicUserInfo() {
        if (!this.token) {
            await this.login()
        }
        const address = this.wallet.address
        const postData = basicUserInfo({ address })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        // const res = await this.req.post('/query', basicUserInfo({ address }))
        return res.data
    }

    async addTypedCredentialItems(p) {
        if (!this.token) {
            await this.login()
        }
        const { ...rest } = p
        const captcha = await getGeetestV4Captcha({
            captcha_id: this.captcha_id,
        })
        // const res = await this.req.post('/query', addTypedCredentialItemsQuery({ captcha, ...rest }))
        const postData = addTypedCredentialItemsQuery({ captcha, ...rest })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        return res.data
    }

    async manuallyVerifyCredential(p) {
        if (!this.token) {
            await this.login()
        }
        const { ...rest } = p
        const captcha = await getGeetestV4Captcha({
            captcha_id: this.captcha_id,
        })
        // const res = await this.req.post('/query', addTypedCredentialItemsQuery({ captcha, ...rest }))
        const postData = manuallyVerifyCredential({ captcha, ...rest })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        return res.data
    }

    async getPrepareParticipate(p) {
        if (!this.token) {
            await this.login()
        }
        const address = this.wallet.address
        const { ...rest } = p
        const captcha = await getGeetestV4Captcha({
            captcha_id: this.captcha_id,
            proxy: this.proxy,
        })
        // const res = await this.req.post('/query', prepareParticipateQuery({ address, captcha, ...rest }))
        const postData = prepareParticipateQuery({ address, captcha, ...rest })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        return res.data
    }

    async verifyCredentialConditionQuery(p) {
        if (!this.token) {
            await this.login()
        }
        const address = this.wallet.address
        // const res = await this.req.post('/query', verifyCredentialConditionQuery({ address, ...p }))

        const postData = verifyCredentialConditionQuery({ address, ...p })
        const res = await post(this.url, postData, this.ops)
        // console.log(res)
        return res.data
    }
}

exports.Galex = Galex


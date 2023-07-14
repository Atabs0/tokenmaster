import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Sort from './components/Sort'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs
import TokenMaster from './abis/TokenMaster.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)

  const [tokenMaster, setTokenMaster] = useState(null)
  const [occasions, setOccasions] = useState([])

  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)   //connects to the blockchain
    setProvider(provider)

    const network = await provider.getNetwork() //gets the networks as they change
    const tokenMaster = new ethers.Contract(config[network.chainId].TokenMaster.address, TokenMaster, provider) 
    setTokenMaster(tokenMaster)//smart contract is here in webform her

    const totalOccasions = await tokenMaster.totalOccasions() //gets the number of occaccsion on chain
    const occasions = []

    for (var i = 1; i <= totalOccasions; i++) { //gets the occasions into the the occasions array
      const occasion = await tokenMaster.getOccasion(i)
      occasions.push(occasion)
    }

    setOccasions(occasions)

    window.ethereum.on('accountsChanged', async () => {  //metamask is connected when when clicked
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = ethers.utils.getAddress(accounts[0])//gets the the address of the account at the oth index
      setAccount(account)
    })
  }

  useEffect(() => {
    loadBlockchainData() //loads the blockchain data
  }, [])

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} /> 

        <h2 className="header__title"><strong>Event</strong> Tickets</h2>
      </header>

      <Sort />

      <div className='cards'>
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            tokenMaster={tokenMaster}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
          />
        ))}
      </div>

      {toggle && (
        <SeatChart
          occasion={occasion}
          tokenMaster={tokenMaster}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;
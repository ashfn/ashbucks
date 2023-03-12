import { Tabs, Center, Paper, LoadingOverlay, Text, Title, Container, Space, TextInput, NumberInput, Button } from '@mantine/core';
import { IconHomeDollar, IconArrowsDiff, IconGift, IconSettingsDollar, IconLogout } from '@tabler/icons-react';
import {useState, useEffect} from 'react'
import { DataTable, DataTableSortStatus  } from 'mantine-datatable';
import dayjs from 'dayjs';
import Router from 'next/router';
import { useDisclosure } from '@mantine/hooks';
import sortBy from 'lodash/sortBy';
import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';

function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });
  
    useEffect(() => {
      // only execute all the code below in client side
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      // Add event listener
      window.addEventListener("resize", handleResize);
       
      // Call handler right away so state gets updated with initial window size
      handleResize();
      
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }

export default function Home() {

    const size = useWindowSize();
    const [userData, setUserData] = useState({"transactions":[],"username":"",balance:0,loaded:false}); 

    const [page, setPage] = useState(1);
    const [records, setRecords] = useState(userData.transactions.slice(0, 5));
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });

    

    useEffect(() => {
      const from = (page - 1) * 5;
      const to = from + 5;
      setRecords(userData.transactions.slice(from, to));
    }, [page]);

    useEffect(() => {
        const from = (page - 1) * 5;
        const to = from + 5;
        const data = sortBy(userData.transactions, sortStatus.columnAccessor);
        setRecords((sortStatus.direction === 'desc' ? data.reverse() : data).slice(from, to))
      }, [sortStatus]);

    function reloadData(){
        if (typeof window !== "undefined") {
            if(localStorage.getItem("username")===null){
                Router.push("/")
            }else{
                const username = localStorage.getItem("username")
                const password = localStorage.getItem("password")
    
                fetch(`http://ashbucks.authorises.repl.co/userinfo?username=${username}&password=${password}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.hasOwnProperty("success")){
                            data.account["loaded"]=true
                            data.account.transactions = data.account.transactions.reverse()
                            setUserData(data.account)
                            setRecords(data.account.transactions.slice(0, 5))
                        }else{
                            localStorage.removeItem("username")
                            localStorage.removeItem("password")
                            Router.push("/")
                        }
                })
            }
        }
    }

    if(!(userData.loaded)){
        reloadData()
    }


    if(userData){
        var show = userData.loaded

        const form = useForm({
            initialValues: {
              recipient: '',
              amount: '',
            }
          });

        const form2 = useForm({
            initialValues: {
              code: ''
            }
          });
    
        const [statusPositive, setStatusPositive] = useState(""); 
        const [statusNegative, setStatusNegative] = useState(""); 

        return (
            <Center sx={{
                "height": "100%"
            }}>
                <Paper mt="md" p="md" shadow="sm" withBorder sx={theme => ({
                    "width": (size.width>1000?"70%":"90%")
                })}>
                    <LoadingOverlay visible={!show} overlayBlur={2} />
                    <Tabs variant="default" radius="sm" defaultValue="dashboard" onTabChange={() =>{
                        setStatusNegative("")
                        setStatusPositive("")
                    }}>
                        <Tabs.List grow>
                        <Tabs.Tab value="dashboard" icon={<IconHomeDollar size="0.8rem" />}>Dashboard</Tabs.Tab>
                        <Tabs.Tab value="transfer" icon={<IconArrowsDiff size="0.8rem" />}>Transfer</Tabs.Tab>
                        <Tabs.Tab value="redeem" icon={<IconGift size="0.8rem" />}>Redeem</Tabs.Tab>
                        <Tabs.Tab value="settings" icon={<IconSettingsDollar size="0.8rem" />}>Settings</Tabs.Tab>
                        </Tabs.List>
                
                        <Tabs.Panel value="dashboard" pt="xs">
                            {show?
                                <div>
                                    <Space h="xl" />
                                    <Title >Your current balance is <Text span c="green.4" inherit>${userData.balance}</Text></Title>
                                    <Space h="xl" />
                                    <DataTable
                                        withBorder
                                        records={records}
                                        columns={[
                                        { accessor: 'from', width: '25%',textAlignment: 'center' },
                                        { accessor: 'to', width: '25%',textAlignment: 'center' },
                                        { accessor: 'amount', width: '25%',textAlignment: 'center', sortable: true },
                                        {
                                            accessor: 'date',
                                            textAlignment: 'center',
                                            width: '25%',
                                            render: ({ date }) => dayjs(date).format('MMM D YYYY'),
                                            sortable: true,
                                        },
                                        ]}
                                        rowStyle={({ from }) => (from === userData.username ? { color: 'rgba(191, 34, 34)' } : { color: 'rgba(105, 219, 124)' })}
                                        totalRecords={userData.transactions.length}
                                        recordsPerPage={5}
                                        page={page}
                                        onPageChange={(p) => setPage(p)}
                                        loadingText="Loading transactions..."
                                        noRecordsText="You have no logged transactions."
                                        paginationText={({ from, to, totalRecords }) => `Showing ${from} - ${to} of ${totalRecords}`}
                                        sortStatus={sortStatus}
                                        onSortStatusChange={setSortStatus}
                                />
                                </div>
                                :
                                <>
                                </>
                            }
                        
                        </Tabs.Panel>
                
                        <Tabs.Panel value="transfer" pt="xs">
                        {show?
                        
                                <Container w="50%">
                                     <Space h="xl" />
                                    <form onSubmit={form.onSubmit((values) => {
                                        const username = localStorage.getItem("username")
                                        const password = localStorage.getItem("password")
                                        fetch(`http://ashbucks.authorises.repl.co/transfer?username=${username}&password=${password}&sendto=${values.recipient}&amount=${values.amount}`)
                                        .then((res) => res.json())
                                        .then((data) => {
                                            if(data.hasOwnProperty("success")){
                                                setStatusPositive("Transferred successfully")
                                                setStatusNegative("")
                                                reloadData()
                                            }else{
                                                setStatusPositive("")
                                                setStatusNegative(data.error)
                                            }
                                        })
                                    })}>
                                        <TextInput label="Recipient" placeholder="Username you want to send ashbucks to" required {...form.getInputProps('recipient')} />
                                        <NumberInput 
                                            label="Amount" 
                                            required 
                                            mt="md" 
                                            placeholder='Enter amount to send'
                                            hideControls
                                            precision={2}
                                            min={0.01}
                                            step={0.05}
                                            max={25000}
                                            {...form.getInputProps('amount')} 
                                        />
                                        <Button leftIcon={<IconArrowsDiff />} type="submit" fullWidth mt="xl">
                                            Transfer
                                        </Button>
                                        <Text c="green.4" fz="sm" ta="center" mt="md">
                                            {statusPositive}
                                        </Text>
                                        <Text c="red.6" fz="sm" ta="center" mt="md">
                                            {statusNegative}
                                        </Text>
                                    </form>
                                </Container>
                                :
                                <>
                                </>
                            }
                        </Tabs.Panel>
                
                        <Tabs.Panel value="redeem" pt="xs">
                        {show?
                                <Container w="50%">
                                    <Space h="xl" />
                                    <form onSubmit={form2.onSubmit((values) => {
                                        const username = localStorage.getItem("username")
                                        const password = localStorage.getItem("password")
                                        fetch(`http://ashbucks.authorises.repl.co/redeem?username=${username}&password=${password}&code=${values.code}`)
                                        .then((res) => res.json())
                                        .then((data) => {
                                            if(data.hasOwnProperty("success")){
                                                setStatusPositive("Redeemed successfully")
                                                setStatusNegative("")
                                                reloadData()
                                            }else{
                                                setStatusPositive("")
                                                setStatusNegative(data.error)
                                            }
                                        })
                                    })}>
                                        <TextInput label="Code" placeholder="XXXXXXXXXX" required {...form2.getInputProps('code')} />
                                        <Button leftIcon={<IconGift />} type="submit" fullWidth mt="xl">
                                            Redeem
                                        </Button>
                                        <Text c="green.4" fz="sm" ta="center" mt="md">
                                            {statusPositive}
                                        </Text>
                                        <Text c="red.6" fz="sm" ta="center" mt="md">
                                            {statusNegative}
                                        </Text>
                                    </form>
                                </Container>
                                :
                                <>
                                </>
                            }
                        </Tabs.Panel>
    
                        <Tabs.Panel value="settings" pt="xs">
                            <Center>
                                <Space h="xl" />
                                <Button leftIcon={<IconLogout/>} onClick={() => {
                                    localStorage.removeItem("username")
                                    localStorage.removeItem("password")
                                    Router.push("/")
                                }}>Log out</Button>
                            </Center>

                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Center>
        );
    }else{
        return(

            <>Error</>

        )
        
    }


  }
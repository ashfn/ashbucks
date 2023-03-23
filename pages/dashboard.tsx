import { Tabs, Center, Paper, LoadingOverlay, Text, Title, Container, Space, TextInput, NumberInput, Button, Checkbox, createStyles } from '@mantine/core';
import { IconHomeDollar, IconArrowsDiff, IconGift, IconSettingsDollar, IconLogout, IconDeviceDesktopAnalytics, IconSpy, IconAxe } from '@tabler/icons-react';
import {useState, useEffect, useRef} from 'react'
import { DataTable, DataTableSortStatus  } from 'mantine-datatable';
import dayjs from 'dayjs';
import Router from 'next/router';
import { useDisclosure } from '@mantine/hooks';
import sortBy from 'lodash/sortBy';
import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import {io, Socket} from 'socket.io-client';
import crypto from "crypto"
import { randomInt } from "crypto";

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

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  gained: (x: number) => void;
  statusbad: (x: string) => void;
  statusgood: (x: string) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  stopmining: () => void;
  username: (username: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

interface StatusMsg {
    good: boolean;
    message: string;
    date: string;
}

type Nullable<T> = T | null

let socket:Nullable<Socket<ServerToClientEvents, ClientToServerEvents>> = null;

const useStyles = createStyles((theme) => ({
    miningConsole: {
        width:"100%",
        marginTop:"10px",
        overflow: "hidden",
        padding: "10px",
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    }
}));

export default function Home() {

    const size = useWindowSize();
    const [userData, setUserData] = useState({"transactions":[],"username":"",balance:0,loaded:false, admin:false}); 

    const [page, setPage] = useState(1);
    const [records, setRecords] = useState(userData.transactions.slice(0, 5));
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });
    const [miningStatus, setMiningStatus] = useState<StatusMsg[]>([])

    const { classes, theme } = useStyles();

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
    
                fetch(`https://ashbucks.onrender.com/userinfo?username=${username}&password=${password}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.hasOwnProperty("success")){
                            data.account["loaded"]=true
                            if(!(data.account.hasOwnProperty("admin"))){
                                data.account["admin"]=false
                            }
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

    var adminTab = (
        <Tabs.Tab value="admin" icon={<IconDeviceDesktopAnalytics size="0.8rem" />}>Admin</Tabs.Tab>
    )

    var adminSection = (
        <Tabs.Panel value="admin" pt="xs">
            <Center>
                <Space h="xl" />
                <Text color="green.4">Secret admin stuff</Text>
            </Center>
        </Tabs.Panel>
    )

    const [connected, setConnected] = useState<boolean>(false);


    const [mining, setMining] = useState<boolean>(false);

    const [totalSolved, setTotalSolved] = useState<number>(0);

    const divRef = useRef<null | HTMLDivElement>(null);

    useEffect((): any => {
        if(socket==undefined){
            socket = io("https://ashbucks.onrender.com")
            socket.on("connect", () => {
                var time = new Date().getTime();
                setMiningStatus((current => [
                    ...current,
                    {good:true, message:"Connected to server", "date":dayjs(time).format('HH:mm')}
                ]))
                console.log("Socket connected..")

                if (typeof window !== "undefined") {
                    if(!(localStorage.getItem("mining")===null)){
                        localStorage.removeItem("mining")
                        setMining(true)
                    }
                 }
                
            })
            socket.on("disconnect", () => {
                var time = new Date().getTime();
                setMiningStatus((current => [
                    ...current,
                    {good:false, message:"Disconnected from server, reload tab to continue mining", "date":dayjs(time).format('HH:mm')}
                ]))

                if(mining){
                    if (typeof window !== "undefined") {
                        console.log("Attempting thing!")
                        localStorage.setItem("mining", "true")
                        Router.reload(window.location.pathname)
                    }
    
                }
            })
    
            socket.on("gained", (x) => {
                var time = new Date().getTime();
                setMiningStatus((current => [
                    ...current,
                    {good:true, message:"Gained "+x+" ashbucks", "date":dayjs(time).format('HH:mm')}
                ]))
                reloadData()
            })

            socket.on("statusbad", (x) => {
                var time = new Date().getTime();
                setMiningStatus((current => [
                    ...current,
                    {good:false, message:x, "date":dayjs(time).format('HH:mm')}
                ]))
                
            })

            socket.on("statusgood", (x) => {
                var time = new Date().getTime();
                setMiningStatus((current => [
                    ...current,
                    {good:true, message:x, "date":dayjs(time).format('HH:mm')}
                ]))
            })
        }
    })

    useEffect(() => {
        divRef.current?.scrollIntoView()
    }, [miningStatus]);

    if(userData){
        var show = userData.loaded

        const form = useForm({
            initialValues: {
              recipient: '',
              amount: '',
              hide: false
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
                        <Tabs.Tab value="mining" icon={<IconAxe size="0.8rem" />}>Mining</Tabs.Tab>
                        {userData.admin ? adminTab : <></>}
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
                                            render: ({ date }) => dayjs(date).format('HH:mm MM/D/YYYY'),
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
                                        fetch(`https://ashbucks.onrender.com/transfer?username=${username}&password=${password}&sendto=${values.recipient}&amount=${values.amount}`)
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
                                        <TextInput 
                                            label="Amount" 
                                            required 
                                            mt="md" 
                                            placeholder='Enter amount to send'
                                            
                                            //precision={2}
                                            //min={0.01}
                                            //step={0.05}
                                            //max={25000}
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
                                        fetch(`https://ashbucks.onrender.com/redeem?username=${username}&password=${password}&code=${values.code}`)
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
    
                        <Tabs.Panel value="mining" pt="xs">
                            <Center>
                                <Space h="xl" />
                                <Paper style={{width:"80%"}}>
                                {mining?
                                    
                                    <Button color="red.6" leftIcon={<IconAxe/>} onClick={() => {
                                        setMining(false)
                                        if(socket!=undefined){
                                            socket.emit("stopmining")
                                        }
                                
                                    }}>Stop Mining</Button>
                                    
                                    :

                                    <Button color="green.4" leftIcon={<IconAxe/>} onClick={() => {
                                        setMining(true)
                                        if(socket!=undefined){
                                            if(userData.loaded){
                                                socket.emit("username", userData.username)
                                            }
                                        }
                                
                                    }}>Start Mining</Button>

                                    }
                                <Center>
                                <div className={classes.miningConsole} key={miningStatus.length}>

                                    <div style={{
                                        overflow: 'auto',
                                        width: '100%',
                                        height: '300px'
                                    }}>

                                    {miningStatus.map((x) => {
                                        return (
                                            <>
                                            <Text color="gray.5">{x.date} <Text span key={Math.random()} color={x.good?"green.4":"red.6"}>{x.message}</Text></Text>
                                            </>
                                        )
                                    })}
                                    <Text  color="green.4" ref={divRef}></Text>
                                    </div>
                                </div>
                                </Center>
                                </Paper>
                                

                            </Center>

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
                        {userData.admin ? adminSection : <></>}
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

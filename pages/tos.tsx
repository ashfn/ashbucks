import {
    createStyles,
    Header,
    HoverCard,
    Group,
    Button,
    UnstyledButton,
    Text,
    SimpleGrid,
    ThemeIcon,
    Anchor,
    Divider,
    Center,
    Box,
    Burger,
    Drawer,
    Collapse,
    ScrollArea,
    rem,
    Image,
    Container,
    Title,
    Accordion,
    Space
  } from '@mantine/core';
  import { useDisclosure } from '@mantine/hooks';
  import {
    IconNotification,
    IconCode,
    IconBook,
    IconChartPie3,
    IconFingerprint,
    IconCoin,
    IconChevronDown,
  } from '@tabler/icons-react';
  import ReactMarkdown from 'react-markdown'
  import Link from 'next/link';
  import Router from "next/router";
  import { useState } from 'react';
  
  const tos = `
  # AshBucks Terms of Service

  - Acceptance of Terms: By using the AshBucks platform, you agree to these Terms of Service in their entirety.
  
  ## Eligibility
  
  - You must be at least 13 years old and capable of entering into legally binding agreements to use AshBucks.
  - Only one account per person is allowed.
  
  ## Use of the Platform
  
  - You can use the AshBucks platform to transfer AshBucks to other users and to mine AshBucks.
  
  ## Fees
  
  - AshBucks may charge fees for transactions and other services on the platform.
  
  ## Privacy Policy
  
  - AshBucks collects and uses user data in accordance with its Privacy Policy, which complies with GDPR regulations.
  
  ## Prohibited Activities
  
  - You may not use AshBucks for any illegal or unauthorized purposes, including but not limited to money laundering, terrorist financing, or fraudulent activities, which are prohibited by GDPR regulations.
  
  ## User Responsibilities
  
  - You are responsible for maintaining the confidentiality of your AshBucks wallet and login information, and for all activities that occur under your account, which complies with GDPR data protection requirements.
  - You are prohibited from creating more than one account.
  
  ## Disclaimers
  
  - AshBucks does not guarantee the accuracy, completeness, or timeliness of any information on the platform and is not responsible for any losses or damages resulting from your use of the platform, as required by GDPR regulations.
  
  ## Intellectual Property
  
  - All content on the AshBucks platform is the property of AshBucks and its licensors, and is protected by copyright, trademark, and other intellectual property laws.
  
  ## Limitation of Liability
  
  - AshBucks is not liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform, as required by GDPR regulations.
  
  ## Termination
  
  - AshBucks may terminate or suspend your account at any time without notice if you violate these Terms of Service, in compliance with GDPR regulations.
  
  ## Mining
  
  - The mining of AshBucks is allowed on the platform.
  - However, AshBucks reserves the right to modify the mining parameters, including difficulty and reward, at any time without notice.
  `

  const useStyles = createStyles((theme) => ({
    faqWrapper: {
      paddingTop: `calc(${theme.spacing.xl} * 2)`,
      paddingBottom: `calc(${theme.spacing.xl} * 2)`,
      minHeight: 650,
    },
  
    faqTitle: {
      marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    },
  
    faqItem: {
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.lg,
      border: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
      }`,
    },
    wrapper: {
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },
  
    inner: {
      position: 'relative',
      paddingTop: rem(200),
      paddingBottom: rem(120),
  
      [theme.fn.smallerThan('sm')]: {
        paddingBottom: rem(80),
        paddingTop: rem(80),
      },
    },
  
    title: {
      fontFamily: `Greycliff CF, ${theme.fontFamily}`,
      fontSize: rem(62),
      fontWeight: 900,
      lineHeight: 1.1,
      margin: 0,
      padding: 0,
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  
      [theme.fn.smallerThan('sm')]: {
        fontSize: rem(42),
        lineHeight: 1.2,
      },
    },
  
    description: {
      marginTop: theme.spacing.xl,
      fontSize: rem(24),
  
      [theme.fn.smallerThan('sm')]: {
        fontSize: rem(18),
      },
    },
  
    controls: {
      marginTop: `calc(${theme.spacing.xl} * 2)`,
  
      [theme.fn.smallerThan('sm')]: {
        marginTop: theme.spacing.xl,
      },
    },
  
    control: {
      height: rem(54),
      paddingLeft: rem(38),
      paddingRight: rem(38),
  
      [theme.fn.smallerThan('sm')]: {
        height: rem(54),
        paddingLeft: rem(18),
        paddingRight: rem(18),
        flex: 1,
      },
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
      textDecoration: 'none',
      color: theme.colorScheme === 'dark' ? theme.white : theme.black,
      fontWeight: 500,
      fontSize: theme.fontSizes.sm,
  
      [theme.fn.smallerThan('sm')]: {
        height: rem(42),
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      },
  
      ...theme.fn.hover({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
      }),
    },
  
    subLink: {
      width: '100%',
      padding: `${theme.spacing.xs} ${theme.spacing.md}`,
      borderRadius: theme.radius.md,
  
      ...theme.fn.hover({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      }),
  
      '&:active': theme.activeStyles,
    },
  
    dropdownFooter: {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
      margin: `calc(${theme.spacing.md} * -1)`,
      marginTop: theme.spacing.sm,
      padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
      paddingBottom: theme.spacing.xl,
      borderTop: `${rem(1)} solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
    },
  
    hiddenMobile: {
      [theme.fn.smallerThan('sm')]: {
        display: 'none',
      },
    },
  
    hiddenDesktop: {
      [theme.fn.largerThan('sm')]: {
        display: 'none',
      },
    },
  }));
  
  
  export default function HeaderMegaMenu() {
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
    const { classes, theme } = useStyles();
  
    const [userData, setUserData] = useState({loaded:false}); 
  
    function reloadData(){
        if (typeof window !== "undefined") {
            if(localStorage.getItem("username")!=null){
                const username = localStorage.getItem("username")
                const password = localStorage.getItem("password")
    
                fetch(`https://ashbucks.authorises.repl.co/userinfo?username=${username}&password=${password}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.hasOwnProperty("success")){
                            data.account["loaded"]=true
                            setUserData(data.account)
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
  
    return (
      <Box pb={120}>
        <Header height={60} px="md">
          <Group position="apart" sx={{ height: '100%' }}>
            <Image maw={140} radius="md" src="./logo.png" alt="Random image" />
  
            <Group sx={{ height: '100%' }} spacing={0} className={classes.hiddenMobile}>
              <Link href="../" className={classes.link}>
                Home
              </Link>
              <Link href="../#faq" className={classes.link}>
                FAQs
              </Link>
              <Link href="" className={classes.link}>
                TOS
              </Link>
            </Group>
  
            <Group className={classes.hiddenMobile}>
            {userData.loaded?
            
            <Button onClick={() => {
              Router.push("/dashboard");
            }}>Dashboard</Button> 
            
            :
            <>
              <Button variant="default" onClick={() => {
                Router.push("/login");
              }}>Log in</Button>
              <Button onClick={() => {
                Router.push("/signup");
              }}>Sign up</Button>
            </>
            }
  
            </Group>
  
            <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
          </Group>
        </Header>
  
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          className={classes.hiddenDesktop}
          zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
            <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
  
            <Link href="../#home" className={classes.link}>
              Home
            </Link>
            <Link href="../#faq" className={classes.link}>
              FAQs
            </Link>
            <Link href="" className={classes.link}>
              TOS
            </Link>
  
            <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
  
            <Group position="center" grow pb="xl" px="md">
              <Button variant="default" onClick={() => {
                Router.push("/login");
              }}>Log in</Button>
              <Button onClick={() => {
                Router.push("/signup");
              }}>Sign up</Button>
            </Group>
          </ScrollArea>
        </Drawer>
  
        <div>
          <Container size={700} p="20px">
            <ReactMarkdown>{tos}</ReactMarkdown>
          </Container>
        </div>
      </Box>
    );
  }
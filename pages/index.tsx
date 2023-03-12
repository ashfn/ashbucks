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

import Link from 'next/link';
import Router from "next/router";
import { useState } from 'react';

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
          if(localStorage.getItem("username")===null){
              Router.push("/")
          }else{
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
            <Link href="#home" className={classes.link}>
              Home
            </Link>
            <Link href="#faq" className={classes.link}>
              FAQs
            </Link>
            <Link href="#tos" className={classes.link}>
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

          <Link href="#home" className={classes.link}>
            Home
          </Link>
          <Link href="#faq" className={classes.link}>
            FAQs
          </Link>
          <Link href="#tos" className={classes.link}>
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

      <div id="home" className={classes.wrapper}>
        <Container size={700} className={classes.inner}>
          <h1 className={classes.title}>
            The{' '}
            <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
              blazingly fast
            </Text>{' '}
            centralised crypto currency
          </h1>

          <Text className={classes.description} color="dimmed">
            Transactions completed in under a second with zero fees. Easily mineable within the browser. Send transactions without a trace.
          </Text>

          <Group className={classes.controls}>
            <Button
              size="xl"
              className={classes.control}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Get started
            </Button>

          </Group>
        </Container>
      </div>
      <Container id="faq" size="sm" className={classes.faqWrapper}>
        <Title align="center" className={classes.faqTitle}>
          Frequently Asked Questions
        </Title>

        <Accordion variant="separated">
          <Accordion.Item className={classes.faqItem} value="how-get">
            <Accordion.Control>How do I get ashbucks?</Accordion.Control>
            <Accordion.Panel>
              Ashbucks can be obtained in three ways:
              <Space h="xs"/>
              ⛏️ mining in your browser, this is the easiest way
              <Space h="xs"/>
              🎁 redeeming codes, these may be found on promotional material
              <Space h="xs"/>
              🧑‍🤝‍🧑 getting sent some by people you know
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.faqItem} value="can-buy">
            <Accordion.Control>Can I buy ashbucks?</Accordion.Control>
            <Accordion.Panel>
              There is no official way to purchase ashbucks for other currencies, such as pound or dollar, but it is not against the terms of service for third parties to sell ashbucks to other people
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.faqItem} value="newsletter">
            <Accordion.Control>How do I reset my password?</Accordion.Control>
            <Accordion.Panel>If you need to reset your password, you can contact support.</Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item className={classes.faqItem} value="credit-card">
            <Accordion.Control>Do you store passwords securely?</Accordion.Control>
            <Accordion.Panel>All passwords are hashed using the latest security standards </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Container>
    </Box>
  );
}
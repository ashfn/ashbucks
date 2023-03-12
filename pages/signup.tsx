import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
  } from '@mantine/core';

import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState, useEffect } from 'react';
import Router from "next/router";
import Link from 'next/link';

export default function Home() {

    const form = useForm({
        initialValues: {
          username: '',
          password: '',
        }
      });

    const [statusPositive, setStatusPositive] = useState(""); 
    const [statusNegative, setStatusNegative] = useState(""); 

    return (
        <Container size={420} my={40}>
        <Title
          align="center"
          sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
        >
          Create account
        </Title>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Already have an account?{' '}
          <Link href="/login">
            <Anchor size="sm" component="button">
              Log in
            </Anchor>
          </Link>
        </Text>
        
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={form.onSubmit((values) => {
                fetch(`http://ashbucks.authorises.repl.co/makeaccount?username=${values.username}&password=${values.password}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.hasOwnProperty("success")){
                            if (typeof window !== "undefined") {
                                localStorage.setItem("username", values.username)
                                localStorage.setItem("password", values.password)
                                setStatusNegative("")
                                setStatusPositive("Account made ✔️")
                                setTimeout(() => {
                                    Router.push("/dashboard");
                                }, 500)
                            }else{
                                setStatusPositive("")
                                setStatusNegative("Couldn't save login.")
                            }

                        }else{
                            setStatusPositive("")
                            setStatusNegative(data.error)
                        }
                    })
            })}>
                <TextInput label="Username" placeholder="Enter a username" required {...form.getInputProps('username')} />
                <PasswordInput label="Password" placeholder="Enter a password" required mt="md" {...form.getInputProps('password')} />
                <Button type="submit" fullWidth mt="xl">
                    Sign up
                </Button>
            </form>
            <Text c="green.4" fz="sm" ta="center" mt="md">
                {statusPositive}
            </Text>
            <Text c="red.6" fz="sm" ta="center" mt="md">
                {statusNegative}
            </Text>
        </Paper>
      </Container>
      );
}

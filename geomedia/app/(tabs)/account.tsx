import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { MyContext } from '../_layout';

import { Text, Stack, Input, Select, Box, ThemeProvider } from "re-native-ui";

export default function Account() {
  const [testo, setTesto] = useState("")
  const ctx = useContext(MyContext);


  const [selectedValue, setSelectedValue] = useState("");

  const [plan, setPlan] = useState("");

  const planOptions = [
    { label: "Basic Plan - $9/month", value: "basic" },
    { label: "Pro Plan - $19/month", value: "pro" },
    { label: "Enterprise Plan - $49/month", value: "enterprise" },
  ];

  useEffect(() => {
    console.log(ctx);

  }, [])

  return (
    <>

      <ThemeProvider>

        <Text>Your name: {ctx?.User?.User?.Name}</Text>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={testo}
          onChangeText={(s) => {
            setTesto(s)
          }}
        />;

        <Box p="md" bg="background" style={{ borderRadius: 8 }}>
          <Select
            label="Choose Your Plan"
            placeholder="Select a plan"
            value={plan}
            onChange={setPlan}
            options={planOptions}
          />
          {plan && (
            <Text variant="caption" style={{ color: "#007AFF", marginTop: 8 }}>
              You selected the {plan} plan
            </Text>
          )}
        </Box>;


        <Stack spacing={4}>
          <Text variant="heading">Product Details</Text>
          <Text variant="body">
            Price: <Text style={{ fontWeight: "bold" }}>$29.99</Text>
          </Text>
          <Text variant="caption">Free shipping on orders over $50</Text>
        </Stack>

      </ThemeProvider>
    </>

  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

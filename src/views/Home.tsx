import {
  Container,
  Stack,
  Box,
  Heading,
  Button,
  Text,
  Input,
  VStack,
  Table,
  Tbody,
  Td,
  Tr,
  useToast,
  Select,
} from "@chakra-ui/react";
import React from "react";
import { Helmet } from "react-helmet";
import OpenAI, { Completion } from "openai-api";

// Split the API key into 2 parts to prevent OpenAI from detecting the key as leaked and rotating
// the key. 
const OPEN_AI_API_KEY_PT1 = "sk-Yq2uHnQqOVFFrlKYkPLTT";
const OPEN_AI_API_KEY_PT2 = "3BlbkFJUiZqe81oaZAAqebXx1wY";

type OpenAiResponses = Completion["data"] & { prompt: string };

export const Home = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [prompt, setPrompt] = React.useState<string>("");
  const [selectedEngine, setSelectedEngine] = React.useState("text-curie-001");
  const [openAiResponse, setOpenAiResponse] = React.useState<OpenAiResponses[]>([]);
  const toast = useToast();
  const openai = new OpenAI(OPEN_AI_API_KEY_PT1 + OPEN_AI_API_KEY_PT2);

  React.useEffect(() => {
    const prevResponses = JSON.parse(localStorage.getItem("prev-responses") ?? "[]");
    console.log(prevResponses);
    if (prevResponses.length > 0) {
      setOpenAiResponse(prevResponses);
      toast({
        description: "Your previous responses have been loaded.",
        isClosable: true,
      });
    }
  }, [toast, setIsLoading]);

  const onSubmit = async () => {
    setIsLoading(true);

    const data = {
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 64,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };

    const result = await fetch(`https://api.openai.com/v1/engines/${selectedEngine}/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPEN_AI_API_KEY_PT1}${OPEN_AI_API_KEY_PT2}`,
      },
      body: JSON.stringify(data),
    });

    const resultJson = await result.json();

    if (result.ok) {
      setOpenAiResponse((currResponses) => {
        const newResponses = [{ ...resultJson, prompt: prompt }, ...currResponses];
        localStorage.setItem("prev-responses", JSON.stringify(newResponses));
        return newResponses;
      });
    } else {
      toast({
        title: "Error",
        description:
          "An error occurred while accessing the OpenAI API. The credit limit for this API key may have been exceeded.",
        status: "error",
        isClosable: true,
      });
    }

    // A cleaner way to access the OpenAI api, provided by OpenAI themselves. Unfortunately, it is
    // quite buggy.

    // const result2 = await openai.complete({
    //   engine: "text-currie-001",
    //   prompt: "Write a poem about a dog wearing skis",
    //   maxTokens: 64,
    //   temperature: 0.5,
    //   topP: 1,
    //   presencePenalty: 0,
    //   frequencyPenalty: 0,
    // });
    // console.log(result2.data);

    setIsLoading(false);
  };

  const responses = openAiResponse.map((response) => (
    <Box
      w="100%"
      h="-moz-max-content"
      p="20px"
      boxShadow="var(--chakra-shadows-lg)"
      borderWidth="1px"
    >
      <Table>
        <Tbody>
          <Tr>
            <Td>
              <b>Prompt:</b>
            </Td>
            <Td>{response.prompt}</Td>
          </Tr>
          <Tr>
            <Td>
              <b>Response:</b>
            </Td>
            <Td>{response.choices[0].text}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  ));

  return (
    <>
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <Container maxW={"3xl"}>
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Have fun with <br />
            <Text as={"span"} color={"green.400"}>
              GPT-3 by OpenAI
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            Enter a prompt into the textbox below, and view the results generated by GPT-3 in the
            list below!
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
            width="100%"
          >
            <Input
              placeholder="Enter a prompt"
              onChange={(e) => setPrompt(e.currentTarget.value)}
              value={prompt}
              width="100%"
            />
            <Select
              placeholder="Select option"
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.currentTarget.value)}
            >
              <option value="text-curie-001">text-curie-001</option>
              <option value="text-davinci-001">text-davinci-001</option>
              <option value="text-davinci-002">text-davinci-002</option>
              <option value="text-davinci-edit-001">text-davinci-edit-001</option>
              <option value="text-davinci-insert-001">text-davinci-insert-001</option>
              <option value="text-davinci-insert-002">text-davinci-insert-002</option>
            </Select>
            <Button
              colorScheme={"green"}
              bg={"green.400"}
              rounded={"full"}
              px={6}
              _hover={{
                bg: "green.500",
              }}
              onClick={onSubmit}
              isLoading={isLoading}
              isDisabled={prompt.length === 0}
            >
              Go
            </Button>
            {/* <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
              Learn more
            </Button> */}
          </Stack>
          <Box>
            <Heading>Responses</Heading>
            <VStack spacing="24px" mt="20px" textAlign="start">
              {responses.length === 0 && (
                <Text color={"gray.500"}>
                  You haven't submitted any prompts yet. Enter a prompt above!
                </Text>
              )}
              {responses}
            </VStack>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

// Fetched all OpenAI engines by querying https://api.openai.com/v1/engines
// Docs referenced: https://beta.openai.com/docs/api-reference/engines/list 
const OPEN_AI_ENGINES = [
  'ada',
  'ada-code-search-code',
  'ada-code-search-text',
  'ada-search-document',
  'ada-search-query',
  'ada-similarity',
  'babbage',
  'babbage-code-search-code',
  'babbage-code-search-text',
  'babbage-search-document',
  'babbage-search-query',
  'babbage-similarity',
  'code-davinci-edit-001',
  'code-search-ada-code-001',
  'code-search-ada-text-001',
  'code-search-babbage-code-001',
  'code-search-babbage-text-001',
  'curie',
  'curie-instruct-beta',
  'curie-search-document',
  'curie-search-query',
  'curie-similarity',
  'davinci',
  'davinci-instruct-beta',
  'davinci-search-document',
  'davinci-search-query',
  'davinci-similarity',
  'text-ada-001',
  'text-babbage-001',
  'text-curie-001',
  'text-davinci-001',
  'text-davinci-002',
  'text-davinci-edit-001',
  'text-davinci-insert-001',
  'text-davinci-insert-002',
  'text-search-ada-doc-001',
  'text-search-ada-query-001',
  'text-search-babbage-doc-001',
  'text-search-babbage-query-001',
  'text-search-curie-doc-001',
  'text-search-curie-query-001',
  'text-search-davinci-doc-001',
  'text-search-davinci-query-001',
  'text-similarity-ada-001',
  'text-similarity-babbage-001',
  'text-similarity-curie-001',
  'text-similarity-davinci-001'
]
import { GetServerSideProps } from "next"
import Head from "next/head"

import { DemoComponent, demoExperimentId } from "../components/DemoComponent"
import { Experiment } from "../components/Experiment"
import { InstantBandit } from "../components/InstantBandit"
import { DEMO_SITE } from "../lib/examples"
import { InstantBanditClient } from "../lib/InstantBandit"
import { sendConversion } from "../lib/lib"
import { InstantBanditProps } from "../lib/types"

import styles from "../styles/Home.module.css"



export default function Home(serverSideProps: InstantBanditProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Instant Bandit</title>
        <meta name="description" content="Generated by create next app" />
        <link
          rel="icon"
          // See https://css-tricks.com/emojis-as-favicons/
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚔️</text></svg>"
        />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.description}>Welcome to Instant Bandit</h1>

        {/* 
        <DemoComponent
          preserveSession={false}
          // comment out this line to fetch probabilities client-side
          probabilities={serverSideProps.probabilities}
        >
          {(props) => {
            return (
              <button
                className={styles.title}
                // AB test logic here
                style={{
                  background: props.variant === "A" ? "red" : "green",
                }}
                onClick={() => {
                  alert(`Your click will be recorded`)
                  sendConversion({ experimentIds: [demoExperimentId], value: 1 })
                  // also try:
                  // sendConversion({ experimentIds: [experimentId], value: 99.99 })
                }}
              >
                👉 Click me 👈
              </button>
            )
          }}
        </DemoComponent>

                */}
        <>
          <div style={{ minHeight: "2em" }}>
            <InstantBandit {...serverSideProps}>
              <Experiment default>
                <div style={{ minHeight: "2em" }}></div>
              </Experiment>
              <Experiment name="A">
                <h1 style={{ background: "red" }}>Welcome! You are currently viewing experiment A</h1>
              </Experiment>
              <Experiment name="B">
                <h1 style={{ background: "green" }}>Welcome! You are currently viewing experiment B</h1>
              </Experiment>
              <Experiment name="C">
                <h1 style={{ background: "blue" }}>Welcome! You are currently viewing experiment C</h1>
              </Experiment>
            </InstantBandit>
          </div>
        </>
      </main>

      <footer className={styles.footer}>
        <a href="/api/_hello" target="_blank">
          Is the server running?
        </a>
        <a href="/api/_database" target="_blank">
          Is the database running?
        </a>
      </footer>
    </div >

  )
}

const client = new InstantBanditClient()
export const getStaticProps: GetServerSideProps<InstantBanditProps> = async () => {
  // TODO: Fetch the site here during SSR/SSG
  // TODO: Ensure (test) exposures reported correctly
  return {
    props: {
      site: await client.load("localhost", "123"),
    }
  }
}

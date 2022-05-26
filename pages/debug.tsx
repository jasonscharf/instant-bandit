import { GetServerSideProps } from "next"
import Head from "next/head"

import { DemoComponent, demoExperimentId } from "../components/DemoComponent"
import { InstantBandit } from "../components/InstantBandit"
import { InstantBanditClient } from "../lib/InstantBandit"
import { InstantBanditProps } from "../lib/types"
import { Placeholder } from "../components/Placeholder"
import { Variant } from "../components/Variant"
import { sendConversion } from "../lib/lib"

import styles from "../styles/Home.module.css"


export default function Debug(serverSideProps: InstantBanditProps) {
  return (
    <InstantBandit {...serverSideProps}>
      <main className={styles.main}>
        <h1 className={styles.header}>Welcome to Instant Bandit</h1>
        <p>
          This page is rendered on-the-fly on the server (SSR) and "hydrated" on the client.
        </p>

        <div className={styles.example}>

          <Placeholder>
            <h1 style={{ background: "pink" }}>Invisible placeholder element to preserve layout</h1>
          </Placeholder>

          <Variant name="A">
            <h1 style={{ background: "red" }}>Welcome! You are currently viewing variant A</h1>
          </Variant>
          <Variant name="B">
            <h1 style={{ background: "green" }}>Welcome! You are currently viewing variant B</h1>
          </Variant>
          <Variant name="C">
            <h1 style={{ background: "blue" }}>Welcome! You are currently viewing variant C</h1>
          </Variant>
        </div>

      </main>
      <div style={{ height: "500px", width: "100%", background: "orange" }}>DIV</div>
    </InstantBandit>

  )
}

// Comment out to have loading done in the browser
const client = new InstantBanditClient()
export const getServerSideProps: GetServerSideProps<InstantBanditProps> = async () => {
  const site = await client.load()
  return {
    props: {
      site,
    }
  }
}

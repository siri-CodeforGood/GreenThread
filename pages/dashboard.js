import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import clientPromise from "../lib/mongodb";

export default function Dashboard({listings}) {
    const {user, error, isLoading} = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;

    return (
        user && (
            <>
                <a href="/api/auth/logout">Logout</a>
                <div>
                    <img src={user.picture} alt={user.name}/>
                    <h2>Hi {user.name} &lt;{user.email}&gt;</h2>
                </div>
                <div>
                    <h1>Current scrap fabric listed</h1>
                    <ul>
                        {listings.map((listing) => (
                            <li>
                                <h2>{listing.title}</h2>
                                <h3>{listing.description}</h3>
                                <p>{listing.price}</p>
                                <p>{listing.timestamp}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        )
    );
}

    export const getServerSideProps = withPageAuthRequired({
        async getServerSideProps() {
            try {
                const client = await clientPromise;
                const db = client.db("greenthread");

                const listings = await db
                    .collection("fabrics")
                    .find({})
                    .sort({ timestamp: -1 })
                    .limit(20)
                    .toArray();

                return {
                    props: { listings: JSON.parse(JSON.stringify(listings)) },
                };
            } catch (e) {
                console.error(e);
            }
        }})
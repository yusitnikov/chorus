import {useEffect} from "react";
import {Layout} from "../src/components/Layout";
import {createProjectUrl} from "../src/misc/url";
import {useRouter} from "next/router";
import Link from "next/link";
import {useTranslate} from "../src/contexts/app";

export default function Index() {
    const translate = useTranslate();

    const router = useRouter();

    useEffect(() => {
        if (window.location.hash) {
            router.replace(window.location.hash.replace("#", ""));
        }
    }, [router]);

    return (
        <Layout title={translate("About the service")}>
            <div className={"block"}>
                {translate("Chorus allows a group of people to record songs and other musical compositions together without being in the same room.")}<br/>
                {translate("In these times of global pandemic, friends and colleagues sometimes find it difficult to get together, and virtual services on the worldwide web come to the rescue.")}
            </div>

            <h2 className={"block"}>
                {translate("How to do it?")}
            </h2>

            <div className={"block"}>
                {translate("It starts with one person recording a song on their webcam.")}<br/>
                {translate("Then they share a link to the project with other people, and each of them is recording how they sing along with the source video.")}<br/>
                {translate("The Chorus service automatically processes all recordings and compiles them into 1 video of everyone singing together.")}
            </div>

            <h2 className={"block"}>
                {translate("So, let's start?")}
            </h2>

            <div className={"block"}>
                <Link href={createProjectUrl}>
                    <a className={"link"}>{translate("Create New Project")}</a>
                </Link>
            </div>
        </Layout>
    )
};

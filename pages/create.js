import {SourceRecorder} from "../src/components/SourceRecorder";
import {Layout} from "../src/components/Layout";
import {createKs} from "../src/misc/kalturaClient";
import {PageNotFound} from "../src/components/errors/PageNotFound";
import {useTranslate} from "../src/contexts/app";

// noinspection JSUnusedGlobalSymbols
export async function getServerSideProps() {
    try {
        const ks = await createKs(false);

        return {
            props: {
                ks,
            },
        };
    } catch (error) {
        console.error("Error at /create", error);

        return {
            props: {
                error: true,
            },
        };
    }
}

export default function Create({ks, error}) {
    const translate = useTranslate();

    if (error) {
        return <PageNotFound/>;
    }

    return (
        <Layout title={translate("Create New Project")}>
            <SourceRecorder ks={ks}/>
        </Layout>
    );
}

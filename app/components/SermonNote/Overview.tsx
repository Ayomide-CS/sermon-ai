type OverviewProps = {
    overview: string;
}

export default function Overview({overview} : OverviewProps){
    return (
        <section>
            <h2>Overview</h2>
            <p>{overview}</p>
        </section>
    );
}
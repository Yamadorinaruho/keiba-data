type resultProps = {
    winner: string
}

export default function Result({ winner }: resultProps) {
    return (
        <div>
            <div>勝者は{winner}です</div>
        </div>
    )
}
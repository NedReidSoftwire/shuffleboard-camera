type CalibrateProps = {
    image: string
}

function Calibrate({image }: CalibrateProps) {

    return (
        <div className="w-full">
            <div className="font-bold text-4xl p-4 text-center">
                Calibrate me pls!
            </div>
            <img src={"data:image/jpeg;base64," + image} alt="beans" />
        </div>
    );
}

export default Calibrate;
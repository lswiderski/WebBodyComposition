import Scanner from '../../components/Scanner'
import { useBodyCompositionContext } from '../../contexts/bodycomposition.context';
export default function Xiaomi() {
    const { bodyComposition } = useBodyCompositionContext();


    return (
        <div>
            <h1>Xiaomi Page</h1>
            <div>
            </div>
            <div>

                <ul>
                    <li>https://googlechrome.github.io/samples/web-bluetooth/scan.html</li>
                    <li> https://github.com/GoogleChrome/samples/tree/gh-pages/web-bluetooth</li></ul>


                <p>This sample illustrates basic use of the Web Bluetooth Scanning API to
                    report advertising packets from nearby Bluetooth Low Energy Devices.</p>

                <p>Note: Scanning is still under development. You must be using Chrome 79+
                    with the <code>chrome://flags/#enable-experimental-web-platform-features</code>&nbsp;
                    flag enabled.</p>
            </div>

            <p> Weight: {bodyComposition.weight} </p>
            <p> Impedance: {bodyComposition.impedance} </p>
            <p> BMI: {bodyComposition.bmi} </p>
            <p> Ideal Weight: {bodyComposition.idealWeight} </p>
            <p> Metabolic Age: {bodyComposition.metabolicAge} </p>
            <p> Water (%): {bodyComposition.waterPercentage} </p>
            <p> Protein Percentage: {bodyComposition.proteinPercentage} </p>
            <p> Basal Metabolism (kCal): {bodyComposition.mbr} </p>
            <p> Fat: {bodyComposition.fat} </p>
            <p> Muscle Mass: {bodyComposition.muscleMass} </p>
            <p> Bone Mass: {bodyComposition.boneMass} </p>
            <p> Visceral Fat: {bodyComposition.visceralFat} </p>
            <p> Body Type: {bodyComposition.bodyType} </p>
            <Scanner></Scanner>



        </div>)
}
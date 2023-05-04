
import AdBanner from "./adbanner";
export default function Footer() {
    return (
        <footer className="text-center items-center">

            <div className="mt-5">
                <AdBanner
                    data-ad-slot="8016871957"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                /></div>
            <div className="mt-5">
                <a href="https://github.com/lswiderski/WebBodyComposition" target="_blank" rel="noopener noreferrer" className="pr-5 underline">GitHub</a>
                <a href="https://twitter.com/L_swiderski" target="_blank" rel="noopener noreferrer" className="pl-5 underline">Twitter</a>
            </div>

        </footer>
    )
}
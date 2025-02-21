import Link from "next/link";
import { useTranslation } from "next-i18next";
import {
	HomeIcon,
	PhoneIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

function LandingPageFooter() {
	const { t } = useTranslation("common");

	return (
		<footer className="bg-gray-800 text-white py-10 dark:bg-gray-900 dark:text-gray-200">
			<div className="container mx-auto px-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

					{/* Branding Section */}
					<div data-aos="fade-zoom-in">
						<h3 className="text-2xl font-bold">{t("Easier")}</h3>
						<p className="mt-2 text-gray-400 dark:text-gray-500">
							{t("tower_management_made_simple_key")}
						</p>
					</div>

					{/* Navigation Links */}
					<div className="flex flex-col items-center md:items-start" data-aos="fade-zoom-in" data-aos-delay="200">
						<h4 className="font-semibold text-lg mb-3">{t("quick_links_key")}</h4>
						<ul className="space-y-2">
							{[
								{ href: "/about", label: t("aboutUs_key"), icon: InformationCircleIcon },
								{ href: "/services", label: t("services_key"), icon: HomeIcon },
								{ href: "/faq", label: t("faq_key"), icon: InformationCircleIcon },
								{ href: "/contact", label: t("contact_key"), icon: PhoneIcon },
							].map(({ href, label, icon: Icon }, idx) => (
								<li key={idx}>
									<Link href={href}>
										<div className="flex items-center hover:underline text-gray-300 dark:text-gray-300 hover:text-gray-400 dark:hover:text-gray-400">
											<Icon className="w-5 h-5 mr-2" />
											<span>{label}</span>
										</div>
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Social Media Links */}
					<div className="flex flex-col items-center md:items-start" data-aos="fade-zoom-in" data-aos-delay="400">
						<h4 className="font-semibold text-lg mb-3">{t("follow_us_key")}</h4>
						<div className="flex space-x-4">
							{[
								{ href: "https://facebook.com", icon: FaFacebookF, label: "Facebook" },
								{ href: "https://twitter.com", icon: FaTwitter, label: "Twitter" },
								{ href: "https://linkedin.com", icon: FaLinkedinIn, label: "LinkedIn" },
							].map(({ href, icon: Icon, label }, idx) => (
								<Link
									key={idx}
									href={href}
									target="_blank"
									aria-label={label}
									className="p-2 bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-all"
								>
									<Icon className="w-5 h-5" />
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default LandingPageFooter;

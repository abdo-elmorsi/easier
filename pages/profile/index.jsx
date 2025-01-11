import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { LayoutWithSidebar, Layout } from "components/layout";
import { getSession } from "next-auth/react";
import { Tabs } from "components/UI";
import { UserCircleIcon, KeyIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types"
import EditProfileForm from "components/pages/profile-page/EditProfileForm";
import ChangePassword from "components/pages/profile-page/ChangePassword";


const Profile = ({ session }) => {
	const { t } = useTranslation("common");

	const tabsData = [
		{
			label: t("general_key"),
			icon: <UserCircleIcon className="h-5 w-5" />,
			content: <EditProfileForm session={session} />,
		},
		{
			label: t("change_password_key"),
			icon: <KeyIcon className="h-5 w-5" />,
			content: <ChangePassword user_name={session?.user?.user_name} />,
		},
	];

	return (
		<div className="flex-1">
			<Tabs tabsData={tabsData} />
		</div>
	);
};

Profile.propTypes = {
	session: PropTypes.object.isRequired
}
Profile.getLayout = function PageLayout(page) {
	return (
		<Layout>
			<LayoutWithSidebar>{page}</LayoutWithSidebar>
		</Layout>
	);
};

export const getServerSideProps = async ({ req, locale, resolvedUrl }) => {
	const session = await getSession({ req });
	const userRole = session?.user?.role;

	if (!session || userRole == "flat") {
		const loginUrl = locale === "en" ? `/${locale}/login` : "/login";
		return {
			redirect: {
				destination: `${loginUrl}?returnTo=${encodeURIComponent(resolvedUrl || "/")}`,
				permanent: false
			}
		};
	} else {
		return {
			props: {
				session,
				...(await serverSideTranslations(locale, ["common"]))
			}
		};
	}
};

export default Profile;
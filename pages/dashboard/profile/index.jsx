import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { LayoutWithSidebar, Layout } from "components/layout";
import { Tabs } from "components/UI";
import { UserCircleIcon, KeyIcon } from "@heroicons/react/24/outline";
import EditProfileForm from "components/pages/profile-page/EditProfileForm";
import ChangePassword from "components/pages/profile-page/ChangePassword";


const Profile = () => {
	const { t } = useTranslation("common");

	const tabsData = [
		{
			label: t("general_key"),
			icon: <UserCircleIcon className="h-5 w-5" />,
			content: <EditProfileForm />,
		},
		{
			label: t("change_password_key"),
			icon: <KeyIcon className="h-5 w-5" />,
			content: <ChangePassword />,
		},
	];

	return (
		<div className="flex-1">
			<Tabs tabsData={tabsData} />
		</div>
	);
};


Profile.getLayout = function PageLayout(page) {
	return (
		<Layout>
			<LayoutWithSidebar>{page}</LayoutWithSidebar>
		</Layout>
	);
};

export const getServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"])),
		},
	};
};

export default Profile;
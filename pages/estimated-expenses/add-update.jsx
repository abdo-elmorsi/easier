import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Input, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { convertImageToBase64, generateCloudinaryUrl } from "utils/utils";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

const Index = () => {
	const router = useRouter();
	const estimatedExpensesId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");



	const { data: flat, isLoading, isValidating, mutate } = useApi(estimatedExpensesId ? `/estimated-expenses?id=${estimatedExpensesId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/estimated-expenses`);




	const electricity = useInput(0, "number", true);
	const water = useInput(0, "number", true);
	const waste = useInput(0, "number", true);
	const guard = useInput(0, "number", true);
	const elevator = useInput(0, "number", true);
	const others = useInput(0, "number", true);
	const notes = useInput("", null);


	const [currentImages, setCurrentImages] = useState([]);
	const [images, setImages] = useState([]);
	const removeImage = (image) => setImages(images.filter((i) => i !== image));

	const updateImages = useCallback(
		async (e) => {
			const files = e.target?.files;

			if (!files || files.length === 0) {
				return;
			}

			const MAX_FILES = 5;
			const MAX_FILE_SIZE_MB = 2; // Example max size of 2MB per file

			// Combine current images with new selections to validate total
			const totalFiles = images.length + files.length;

			if (totalFiles > MAX_FILES) {
				handleMessage("maximum_images_available_for_upload_key", "warning");
				e.target.value = ""; // Reset input value
				return;
			}

			try {
				const newFiles = await Promise.all(
					Array.from(files).map(async (file) => {
						if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
							throw new Error(`${file.name} exceeds the size limit of ${MAX_FILE_SIZE_MB}MB.`);
						}
						return await convertImageToBase64(file);
					})
				);

				setImages((prevImages) => [...prevImages, ...newFiles]);
			} catch (error) {
				console.error('Error uploading images:', error);
				handleMessage(error.message || "error_uploading_images_key", "error");
				setImages([]); // Clear images or handle as needed
			}

			e.target.value = ""; // Reset input value to allow selecting the same files again
		}, [images])





	const onSubmit = async (e) => {
		e.preventDefault();
		const newEstimatedExpenses = {
			...(estimatedExpensesId ? { id: estimatedExpensesId } : {}),
			electricity: +electricity?.value || 0,
			water: +water?.value || 0,
			waste: +waste?.value || 0,
			guard: +guard?.value || 0,
			elevator: +elevator?.value || 0,
			others: +others?.value || 0,
			notes: notes?.value,
			images
		}

		try {
			await executeMutation(estimatedExpensesId ? 'PUT' : "POST", newEstimatedExpenses);
			estimatedExpensesId && mutate(`/estimated-expenses?id=${estimatedExpensesId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!flat) {
			electricity.changeValue(flat?.electricity || 0);
			water.changeValue(flat?.water || 0);
			waste.changeValue(flat?.waste || 0);
			guard.changeValue(flat?.guard || 0);
			elevator.changeValue(flat?.elevator || 0);
			others.changeValue(flat?.others || 0);
			notes.changeValue(flat?.notes);
			flat?.attachments?.length && setCurrentImages(flat.attachments)
		}
	}, [isLoading])



	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("estimated_expenses_key")}
					path="/estimated-expenses"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{
						label: estimatedExpensesId ? t("edit_key") : t("add_key"),
						path: `add-update${estimatedExpensesId ? `?id=${estimatedExpensesId}` : ""}`
					}]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">

								<Input
									mandatory
									label={t("electricity_key")}
									{...electricity.bind}
								/>
								<Input
									mandatory
									label={t("water_key")}
									{...water.bind}
								/>
								<Input
									mandatory
									label={t("waste_key")}
									{...waste.bind}
								/>
								<Input
									mandatory
									label={t("guard_key")}
									{...guard.bind}
								/>
								<Input
									mandatory
									label={t("elevator_key")}
									{...elevator.bind}
								/>
								<Input
									mandatory
									label={t("others_key")}
									{...others.bind}
								/>
								<Input
									placeholder={t("notes_key")}
									label={t("notes_key")}
									{...notes.bind}
								/>
								<div className="flex flex-col">
									<div className="flex items-center justify-start gap-2 flex-wrap">
										{images.map((image, index) => (
											<div className="relative">
												<XMarkIcon onClick={() => removeImage(image)} className="cursor-pointer w-5 h-5 absolute -top-2 -left-2 text-red-500" />
												<img
													key={image}
													src={image}
													alt={`Image ${index + 1}`}
													className="w-12 h-12 object-cover rounded-md"
												/>
											</div>
										))}
										{images.length && currentImages.length ? <span className="w-1 h-full bg-primary mx-2"></span> : ""}
										{currentImages.map((image) => (
											<div className="relative">
												<CheckCircleIcon className="w-5 h-5 absolute -top-2 -left-2 text-green-500" />
												<img
													key={image}
													src={generateCloudinaryUrl(image)}
													alt={`Image ${image}`}
													className="w-12 h-12 object-cover rounded-md"
												/>
											</div>
										))}
									</div>
									<Input
										type="file"
										multiple={true}
										max={3}
										accept="image/*"
										placeholder={t("upload_images_key")}
										label={t("images_key")}
										onChange={updateImages}
									/>
								</div>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating}
									className="btn--primary w-32 flex items-center justify-center"
									type="submit"
								>
									{isMutating ? (
										<>
											<Spinner className="mr-3 h-4 w-4 rtl:ml-3" /> {t("loading_key")}
										</>
									) : (
										t("save_key")
									)}
								</Button>
								<Button
									disabled={isMutating}
									className="btn--secondary w-32"
									onClick={() => router.back()}
								>
									{t("cancel_key")}
								</Button>
							</div>
						</form>}
				</div>
			</div>
		</>
	);
};



Index.getLayout = function PageLayout(page) {
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

export default Index;
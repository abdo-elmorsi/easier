import React from "react";
import { useRouter } from "next/router";
import moment from "moment-timezone";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const ChatMessage = ({ msg, session, onEdit, onDelete }) => {
	const { t } = useTranslation("common");

	const router = useRouter();
	const language = router.locale.toLowerCase();
	const dateFormat = language === "en" ? "DD-MM (hh:mm A)" : "DD-MM (hh:mm A)";
	const isCurrentUser = msg.flat_id === session?.user?.id || (session?.user.role != "flat" && !msg?.flat_id);

	return (
		<div className={`animate-flip-up flex ${isCurrentUser ? 'justify-start' : 'justify-end'} mb-4`}>
			<div className={`relative group max-w-[95%] md:max-w-[85%] p-3 rounded-lg shadow-md ${isCurrentUser
				? 'bg-primary text-white rounded-bl-none'
				: 'bg-white dark:bg-gray-700 rounded-br-none'
				}`}>
				<div className={`flex items-center gap-2 mb-1`}>
					<span className={`font-semibold text-sm  dark:text-gray-100`}>
						{msg.flat ? `${msg.flat_id === session?.user?.id ? t("you_key") : `Flat n: ${msg.flat?.number} / f: ${msg.flat?.floor}`}` : t("admin_key")}
					</span>
					<span className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'} `}>
						{moment(msg.created_at).format(dateFormat)}
					</span>
					{isCurrentUser && (
						<div className={`opacity-0  absolute -right-2 -top-2 group-hover:opacity-100 flex gap-1`}>
							<button
								onClick={() => {
									const newMessage = prompt("Enter new message:", msg.content);
									if (newMessage) onEdit(msg.id, newMessage);
								}}
								className="p-1 hover:bg-green-600 rounded-full transition-colors"
								aria-label="Edit message"
							>
								<PencilSquareIcon className="h-4 w-4 text-white" />
							</button>
							<button
								onClick={() => onDelete(msg.id)}
								className="p-1 hover:bg-red-500 rounded-full transition-colors"
								aria-label="Delete message"
							>
								<TrashIcon className="h-4 w-4 text-white" />
							</button>
						</div>
					)}
				</div>

				<div className={`relative`}>
					<p className={`break-words ${isCurrentUser ? 'text-white' : 'dark:text-gray-200'}`}>
						{msg.content}
					</p>


				</div>
			</div>
		</div>
	);
};

export default React.memo(ChatMessage);
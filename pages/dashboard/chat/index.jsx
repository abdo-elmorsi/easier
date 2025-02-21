import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSession } from "next-auth/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { useApi, useApiMutation } from "hooks/useApi";
import { Button, Input, Spinner } from "components/UI";
import { ChatMessage, ChatMessageSkeleton } from "components/pages/chat";
import { useHandleMessage } from "hooks";



const Index = () => {
    const messagesEndRef = useRef(null);
    const { data: session, status } = useSession();
    const { t } = useTranslation("common");
    const [message, setMessage] = useState('');
    const handleMessage = useHandleMessage();

    const {
        data: messages,
        isLoading,
        isValidating,
        mutate
    } = useApi(status === "authenticated" ? `/chat/?tower_id=${session?.user?.tower_id}` : "", {
        revalidateOnFocus: true,
        refreshInterval: 4000
    });

    const { executeMutation, isMutating } = useApiMutation(`/chat`);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isMutating) return;

        try {
            await executeMutation("POST", { content: message });
            setMessage('');
            mutate();
        } catch (error) {
            handleMessage(t('message_send_error_key') + ': ' + error?.message);
        }
    };


    const handleDeleteMessage = async (id) => {
        if (!window.confirm(t('confirm_delete_message_key'))) return;

        try {
            await executeMutation("DELETE", { id });
            mutate();
        } catch (error) {
            handleMessage(t('delete_message_error_key') + ': ' + error?.message);

        }
    };

    const handleEditMessage = async (id, content) => {
        if (!content?.trim()) return;

        try {
            await executeMutation("PUT", { id, content });
            mutate();
        } catch (error) {
            handleMessage(t('edit_message_error_key') + ': ' + error?.message);

        }
    };



    const prevMessagesRef = useRef([]);

    // New message detection logic
    useEffect(() => {
        if (messages && messages.length > 0) {
            const newMessages = messages.filter(
                msg => !prevMessagesRef.current.some(prevMsg => prevMsg.id === msg.id)
            );

            if (newMessages.length > 0) {
                const lastMessage = newMessages[newMessages.length - 1];
                if ((!lastMessage?.flat_id && session?.user?.role == "flat") || (lastMessage?.flat_id && lastMessage?.flat_id != session?.user?.id)) {

                    const audio = new Audio("/new_message.mp3");
                    audio.play().catch(err => console.error('Failed to play audio:', err));
                }


            }
        }

        prevMessagesRef.current = messages || [];
    }, [messages]);

    // Modified scroll effect
    useEffect(() => {
        if (messages && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    return (
        <div className="">
            <Header
                title={t("chat_key")}
                path="/dashboard/chat"
                classes="bg-gray-100 dark:bg-gray-700 border-none"
            />
            <div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 md:p-4 h-[calc(100vh-250px)] overflow-y-auto mb-4">
                    {status !== "loading" && !isLoading ? (
                        messages?.map(msg => (
                            <ChatMessage
                                key={msg.id}
                                msg={msg}
                                session={session}
                                onEdit={handleEditMessage}
                                onDelete={handleDeleteMessage}
                            />
                        ))
                    ) : (
                        <ChatMessageSkeleton />
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex gap-4 items-center">
                    <Input
                        formGroup={false}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('type_message_placeholder_key')}
                    />
                    <Button
                        type="submit"
                        className="flex justify-between items-center gap-2 btn--primary"
                        // className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={!message.trim() || isMutating}
                    >
                        {isMutating ? <Spinner className="h-5 w-5" />
                            : <>
                                <PaperAirplaneIcon className="w-5 h-5" />
                                <span>{t('send_key')}</span>
                            </>}
                    </Button>
                </form>
            </div>
        </div>
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
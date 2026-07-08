import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  TextArea,
  TextInput,
} from '../../components/ui'

export function MessagesPage() {
  const queryClient = useQueryClient()
  const [toUserId, setToUserId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendEmailCopy, setSendEmailCopy] = useState(true)

  const messagesQuery = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: adminApi.getMessages,
  })

  const sendMutation = useMutation({
    mutationFn: () => adminApi.sendMessage({ toUserId, subject, body, sendEmailCopy }),
    onSuccess: () => {
      setToUserId('')
      setSubject('')
      setBody('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] })
    },
  })

  if (messagesQuery.isLoading) return <LoadingState />
  if (messagesQuery.error || !messagesQuery.data) return <ErrorState message={messagesQuery.error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Support communications"
        title="Messages"
        description="Send and receive messages to providers and seekers from the support account. Optionally send an email copy."
      />

      <Card className="mb-8">
        <h2 className="text-xl font-medium text-ink">Compose message</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Recipient user ID
            <TextInput
              placeholder="Paste user id from User Management"
              value={toUserId}
              onChange={(event) => setToUserId(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Subject
            <TextInput value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Message
            <TextArea value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-charcoal">
            <input
              type="checkbox"
              className="size-4 rounded-sm border-steel accent-primary"
              checked={sendEmailCopy}
              onChange={(event) => setSendEmailCopy(event.target.checked)}
            />
            Also send email copy to recipient
          </label>
          <Button
            disabled={sendMutation.isPending || !toUserId.trim() || !subject.trim() || !body.trim()}
            onClick={() => sendMutation.mutate()}
          >
            Send message
          </Button>
          {sendMutation.error ? (
            <p className="text-sm font-medium text-danger-deep">{sendMutation.error.message}</p>
          ) : null}
        </div>
      </Card>

      <DataTable headers={['From', 'To', 'Subject', 'Sent', 'Preview']}>
        {messagesQuery.data.map((message) => (
          <tr key={message.id}>
            <td className="px-6 py-4 text-charcoal">{message.from}</td>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{message.to}</p>
              <p className="text-sm text-charcoal">{message.toEmail}</p>
            </td>
            <td className="px-6 py-4 font-medium text-ink">{message.subject}</td>
            <td className="px-6 py-4 text-charcoal">{new Date(message.sentAt).toLocaleString()}</td>
            <td className="px-6 py-4 text-sm text-charcoal">{message.body.slice(0, 120)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}

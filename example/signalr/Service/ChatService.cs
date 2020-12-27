using Example.Contract;
using Example.Hubs;
using Example.Hubs.Clients;
using Example.ViewModel;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Example.Service
{
    public class ChatService : IChatService  {
        private readonly IHubContext<ChatHub, IChatClient> chatHub;

        public ChatService(IHubContext<ChatHub, IChatClient> chatHub)
        {
            this.chatHub = chatHub;
            this.chatHub = chatHub;
        }

        public async Task StartWorkAsync(StartWorkVm message)
        {
            await chatHub.Clients.All.StartWorkAsync(message);
        }

    }

}

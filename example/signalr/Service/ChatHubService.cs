using Example.Contract;
using Example.Hubs;
using Example.Hubs.Clients;
using Example.ViewModel;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Example.Service
{
    public class ChatHubService : IChatHubService
    {
        private readonly IHubContext<ChatHub, IChatClient> _hub;

        public ChatHubService(IHubContext<ChatHub, IChatClient> hub)
        {
            _hub = hub;
        }

        public async Task StartWorkAsync(StartWorkVm message)
        {
            await _hub.Clients.All.StartWorkAsync(message);
            // await _hub.Clients.User("userId").StartWorkAsync(message);
            // await _hub.Clients.Groups("groups").StartWorkAsync(message);
            // and Other Clients.
        }

        public async Task StopWork(StopWorkVm message)
        {
            await _hub.Clients.All.StopWorkAsync(message);
        }
    }
}

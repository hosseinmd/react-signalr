using Example.Hubs.Clients;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using Example.ViewModel;

namespace Example.Hubs
{
    public class ChatHub : Hub<IChatClient>
    {
        public async override Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {

            await base.OnDisconnectedAsync(exception);
        }
         public async Task StartWorkAsync( ViewModel.StartWorkVm message)
        {
            await Clients.All.StartWorkAsync(message);
            // await _hub.Clients.User("userId").StartWorkAsync(message);
            // await _hub.Clients.Groups("groups").StartWorkAsync(message);
            // and Other Clients.
        }
    }
}

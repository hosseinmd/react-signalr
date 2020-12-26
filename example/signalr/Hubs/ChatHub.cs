using Example.Hubs.Clients;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

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
    }
}

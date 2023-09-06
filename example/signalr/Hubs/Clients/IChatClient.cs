using Example.ViewModel;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Example.Hubs.Clients
{
    public interface IChatClient
    {
        [HubMethodName("hello")]
        Task Hello(string message);

        [HubMethodName("startwork")]
        Task StartWorkAsync(StartWorkVm message);

        [HubMethodName("stopwork")]
        Task StopWorkAsync(StopWorkVm message);

    }
}

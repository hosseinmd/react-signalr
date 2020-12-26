using Example.ViewModel;
using System.Threading.Tasks;

namespace Example.Contract
{
    public interface IChatHubService
    {
        Task StartWorkAsync(StartWorkVm message);
        Task StopWork(StopWorkVm message);
    }
}

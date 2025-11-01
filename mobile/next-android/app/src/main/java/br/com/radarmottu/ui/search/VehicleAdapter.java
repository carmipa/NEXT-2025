package br.com.radarmottu.ui.search;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.ArrayList;
import java.util.List;
import br.com.radarmottu.R;
import br.com.radarmottu.model.Vehicle;

public class VehicleAdapter extends RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder> {

    private List<Vehicle> vehicles = new ArrayList<>();
    private OnVehicleClickListener listener;

    public interface OnVehicleClickListener {
        void onVehicleClick(Vehicle vehicle);
    }

    public VehicleAdapter(OnVehicleClickListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public VehicleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_vehicle, parent, false);
        return new VehicleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VehicleViewHolder holder, int position) {
        Vehicle vehicle = vehicles.get(position);
        holder.bind(vehicle, listener);
    }

    @Override
    public int getItemCount() {
        return vehicles.size();
    }

    public void setVehicles(List<Vehicle> newVehicles) {
        this.vehicles = newVehicles;
        notifyDataSetChanged();
    }

    static class VehicleViewHolder extends RecyclerView.ViewHolder {
        private TextView plateTextView;
        private TextView modelTextView;
        private TextView statusTextView;

        public VehicleViewHolder(@NonNull View itemView) {
            super(itemView);
            plateTextView = itemView.findViewById(R.id.tv_item_plate);
            modelTextView = itemView.findViewById(R.id.tv_item_model);
            statusTextView = itemView.findViewById(R.id.tv_item_status);
        }

        public void bind(final Vehicle vehicle, final OnVehicleClickListener listener) {
            plateTextView.setText(vehicle.getPlaca());
            modelTextView.setText(vehicle.getModelo());
            statusTextView.setText("-"); // CORREÇÃO: Status não existe mais no modelo
            
            itemView.setOnClickListener(v -> listener.onVehicleClick(vehicle));
        }
    }
}
